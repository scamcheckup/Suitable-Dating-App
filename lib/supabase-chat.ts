import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  created_at: string;
  read_at?: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface ChatChannel {
  id: string;
  match_id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at?: string;
  user1_online: boolean;
  user2_online: boolean;
  created_at: string;
  other_user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Create chat channel when users match
export const createChatChannel = async (matchId: string, user1Id: string, user2Id: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_channels')
      .insert({
        match_id: matchId,
        user1_id: user1Id,
        user2_id: user2Id,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, channel: data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get user's chat channels
export const getUserChatChannels = async (userId: string): Promise<{ channels: ChatChannel[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('chat_channels')
      .select(`
        *,
        user1:users!chat_channels_user1_id_fkey(id, name, profile_photos),
        user2:users!chat_channels_user2_id_fkey(id, name, profile_photos)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    // Format channels with other user info
    const formattedChannels = data?.map(channel => ({
      ...channel,
      other_user: channel.user1_id === userId ? {
        id: channel.user2.id,
        name: channel.user2.name,
        avatar: channel.user2.profile_photos?.[0],
      } : {
        id: channel.user1.id,
        name: channel.user1.name,
        avatar: channel.user1.profile_photos?.[0],
      }
    })) || [];

    return { channels: formattedChannels, error: null };
  } catch (error) {
    return { channels: [], error };
  }
};

// Send a message
export const sendMessage = async (
  channelId: string,
  senderId: string,
  content: string,
  messageType: 'text' | 'image' | 'file' = 'text',
  fileUrl?: string
) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        channel_id: channelId,
        sender_id: senderId,
        content,
        message_type: messageType,
        file_url: fileUrl,
      })
      .select()
      .single();

    if (error) throw error;

    // Update channel's last message
    await supabase
      .from('chat_channels')
      .update({
        last_message: messageType === 'text' ? content : `Sent ${messageType}`,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', channelId);

    return { success: true, message: data };
  } catch (error) {
    return { success: false, error };
  }
};

// Get messages for a channel
export const getChannelMessages = async (
  channelId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ messages: ChatMessage[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users!chat_messages_sender_id_fkey(name, profile_photos)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const formattedMessages = data?.map(msg => ({
      ...msg,
      sender_name: msg.sender.name,
      sender_avatar: msg.sender.profile_photos?.[0],
    })) || [];

    return { messages: formattedMessages.reverse(), error: null };
  } catch (error) {
    return { messages: [], error };
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Update user online status
export const updateOnlineStatus = async (userId: string, channelId: string, isOnline: boolean) => {
  try {
    // Get channel to determine which user field to update
    const { data: channel } = await supabase
      .from('chat_channels')
      .select('user1_id, user2_id')
      .eq('id', channelId)
      .single();

    if (!channel) return { success: false };

    const updateField = channel.user1_id === userId ? 'user1_online' : 'user2_online';
    
    const { error } = await supabase
      .from('chat_channels')
      .update({ [updateField]: isOnline })
      .eq('id', channelId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Subscribe to real-time messages
export const subscribeToMessages = (
  channelId: string,
  onNewMessage: (message: ChatMessage) => void,
  onMessageUpdate: (message: ChatMessage) => void
): RealtimeChannel => {
  return supabase
    .channel(`messages:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`,
      },
      async (payload) => {
        // Fetch sender info
        const { data: sender } = await supabase
          .from('users')
          .select('name, profile_photos')
          .eq('id', payload.new.sender_id)
          .single();

        const message: ChatMessage = {
          ...payload.new,
          sender_name: sender?.name,
          sender_avatar: sender?.profile_photos?.[0],
        };

        onNewMessage(message);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`,
      },
      async (payload) => {
        const { data: sender } = await supabase
          .from('users')
          .select('name, profile_photos')
          .eq('id', payload.new.sender_id)
          .single();

        const message: ChatMessage = {
          ...payload.new,
          sender_name: sender?.name,
          sender_avatar: sender?.profile_photos?.[0],
        };

        onMessageUpdate(message);
      }
    )
    .subscribe();
};

// Subscribe to channel updates (online status, etc.)
export const subscribeToChannelUpdates = (
  channelId: string,
  onChannelUpdate: (channel: any) => void
): RealtimeChannel => {
  return supabase
    .channel(`channel:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_channels',
        filter: `id=eq.${channelId}`,
      },
      (payload) => {
        onChannelUpdate(payload.new);
      }
    )
    .subscribe();
};

// Upload file for chat
export const uploadChatFile = async (file: File, channelId: string, messageType: 'image' | 'file') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${channelId}/${Date.now()}.${fileExt}`;
    const bucketName = messageType === 'image' ? 'chat-images' : 'chat-files';

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    return { success: false, error };
  }
};