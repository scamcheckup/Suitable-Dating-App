import { StreamChat } from 'stream-chat';
import { supabase } from './supabase';

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || '';
const STREAM_SECRET = process.env.EXPO_PUBLIC_STREAM_SECRET || '';

// Initialize Stream Chat client
export const chatClient = StreamChat.getInstance(STREAM_API_KEY);

export interface ChatUser {
  id: string;
  name: string;
  image?: string;
}

export const connectUserToChat = async (user: ChatUser, token?: string) => {
  try {
    // Generate token if not provided (in production, do this server-side)
    const userToken = token || chatClient.createToken(user.id);
    
    await chatClient.connectUser(user, userToken);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const createChatChannel = async (matchId: string, user1: ChatUser, user2: ChatUser) => {
  try {
    const channel = chatClient.channel('messaging', matchId, {
      name: `${user1.name} & ${user2.name}`,
      members: [user1.id, user2.id],
      created_by_id: user1.id,
    });

    await channel.create();
    return { success: true, channel };
  } catch (error) {
    return { success: false, error };
  }
};

export const getUserChannels = async () => {
  try {
    const filter = { members: { $in: [chatClient.userID] } };
    const sort = { last_message_at: -1 };
    const channels = await chatClient.queryChannels(filter, sort);
    
    return { success: true, channels };
  } catch (error) {
    return { success: false, error };
  }
};

export const disconnectFromChat = async () => {
  try {
    await chatClient.disconnectUser();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};