import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Search, Send, Paperclip, ArrowLeft, Circle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserChatChannels, 
  getChannelMessages, 
  sendMessage, 
  subscribeToMessages, 
  subscribeToChannelUpdates,
  updateOnlineStatus,
  uploadChatFile,
  ChatChannel,
  ChatMessage 
} from '@/lib/supabase-chat';

export default function ChatsScreen() {
  const { user, userProfile } = useAuth();
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (user && userProfile) {
      loadChannels();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user, userProfile]);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages();
      setupRealtimeSubscription();
      updateOnlineStatus(user.id, selectedChannel.id, true);

      return () => {
        updateOnlineStatus(user.id, selectedChannel.id, false);
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }
      };
    }
  }, [selectedChannel]);

  const loadChannels = async () => {
    try {
      const { channels: userChannels, error } = await getUserChatChannels(user.id);
      if (error) {
        console.error('Error loading channels:', error);
        return;
      }
      setChannels(userChannels);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedChannel) return;

    try {
      const { messages: channelMessages, error } = await getChannelMessages(selectedChannel.id);
      if (error) {
        console.error('Error loading messages:', error);
        return;
      }
      setMessages(channelMessages);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!selectedChannel) return;

    subscriptionRef.current = subscribeToMessages(
      selectedChannel.id,
      (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (updatedMessage) => {
        setMessages(prev => 
          prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        );
      }
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const { success, error } = await sendMessage(
        selectedChannel.id,
        user.id,
        messageContent
      );

      if (!success) {
        Alert.alert('Error', 'Failed to send message');
        setNewMessage(messageContent); // Restore message
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      setNewMessage(messageContent); // Restore message
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedChannel) return;

    try {
      // Create file input for web
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,*';
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          // Check file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            Alert.alert('File Too Large', 'Please select a file smaller than 10MB');
            return;
          }

          setSending(true);
          
          const messageType = file.type.startsWith('image/') ? 'image' : 'file';
          const { success, url, error } = await uploadChatFile(file, selectedChannel.id, messageType);
          
          if (success && url) {
            await sendMessage(
              selectedChannel.id,
              user.id,
              file.name,
              messageType,
              url
            );
          } else {
            Alert.alert('Upload Failed', 'Failed to upload file');
          }
          
          setSending(false);
        }
      };
      input.click();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isOwnMessage = message.sender_id === user.id;
    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].sender_id !== message.sender_id);

    return (
      <Animated.View 
        key={message.id}
        entering={FadeInDown.delay(index * 50)}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
        ]}
      >
        {showAvatar && (
          <Image 
            source={{ uri: message.sender_avatar || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' }}
            style={styles.messageAvatar}
          />
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          !showAvatar && !isOwnMessage && styles.messageWithoutAvatar
        ]}>
          {message.message_type === 'image' && message.file_url && (
            <Image source={{ uri: message.file_url }} style={styles.messageImage} />
          )}
          
          {message.message_type === 'file' && message.file_url && (
            <TouchableOpacity 
              style={styles.fileMessage}
              onPress={() => window.open(message.file_url, '_blank')}
            >
              <Paperclip size={16} color="#6B7280" />
              <Text style={styles.fileName}>{message.content}</Text>
            </TouchableOpacity>
          )}
          
          {message.message_type === 'text' && (
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {message.content}
            </Text>
          )}
          
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatTimestamp(message.created_at)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderChannelItem = (channel: ChatChannel, index: number) => (
    <Animated.View 
      key={channel.id}
      entering={FadeInDown.delay(index * 100)}
    >
      <TouchableOpacity 
        style={styles.channelItem}
        onPress={() => setSelectedChannel(channel)}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: channel.other_user?.avatar || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' }}
            style={styles.avatar}
          />
          {((channel.user1_id === user.id && channel.user2_online) || 
            (channel.user2_id === user.id && channel.user1_online)) && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        
        <View style={styles.channelContent}>
          <View style={styles.channelHeader}>
            <Text style={styles.channelName}>{channel.other_user?.name}</Text>
            {channel.last_message_at && (
              <Text style={styles.timestamp}>
                {formatTimestamp(channel.last_message_at)}
              </Text>
            )}
          </View>
          
          {channel.last_message && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {channel.last_message}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Chat view
  if (selectedChannel) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedChannel(null)}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          
          <View style={styles.chatHeaderInfo}>
            <Image 
              source={{ uri: selectedChannel.other_user?.avatar || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' }}
              style={styles.chatHeaderAvatar}
            />
            <View>
              <Text style={styles.chatHeaderName}>{selectedChannel.other_user?.name}</Text>
              <View style={styles.onlineStatus}>
                <Circle 
                  size={8} 
                  color={((selectedChannel.user1_id === user.id && selectedChannel.user2_online) || 
                          (selectedChannel.user2_id === user.id && selectedChannel.user1_online)) ? '#10B981' : '#9CA3AF'} 
                  fill={((selectedChannel.user1_id === user.id && selectedChannel.user2_online) || 
                         (selectedChannel.user2_id === user.id && selectedChannel.user1_online)) ? '#10B981' : '#9CA3AF'} 
                />
                <Text style={styles.onlineStatusText}>
                  {((selectedChannel.user1_id === user.id && selectedChannel.user2_online) || 
                    (selectedChannel.user2_id === user.id && selectedChannel.user1_online)) ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.messageInputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={handleFileUpload}
            disabled={sending}
          >
            <Paperclip size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
            placeholderTextColor="#9CA3AF"
            editable={!sending}
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Channels list view
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.channelsList}
        showsVerticalScrollIndicator={false}
      >
        {channels.length > 0 ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Messages</Text>
              {channels.map(renderChannelItem)}
            </View>

            {/* Chat Tips */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>Chat Tips</Text>
              
              <View style={styles.tip}>
                <View style={styles.tipIcon}>
                  <MessageCircle size={16} color="#FF6B6B" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Be Genuine</Text>
                  <Text style={styles.tipDescription}>
                    Authentic conversations lead to meaningful connections
                  </Text>
                </View>
              </View>
              
              <View style={styles.tip}>
                <View style={styles.tipIcon}>
                  <Circle size={16} color="#10B981" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Ask Questions</Text>
                  <Text style={styles.tipDescription}>
                    Show interest by asking about their hobbies and interests
                  </Text>
                </View>
              </View>
              
              <View style={styles.tip}>
                <View style={styles.tipIcon}>
                  <Circle size={16} color="#8B5CF6" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Plan to Meet</Text>
                  <Text style={styles.tipDescription}>
                    Suggest meeting in person when you feel comfortable
                  </Text>
                </View>
              </View>
            </Animated.View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Start chatting with your matches to begin meaningful conversations
            </Text>
            
            <TouchableOpacity style={styles.findMatchesButton}>
              <Text style={styles.findMatchesButtonText}>Find Matches</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelsList: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  channelContent: {
    flex: 1,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  ownMessageBubble: {
    backgroundColor: '#FF6B6B',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageWithoutAvatar: {
    marginLeft: 40,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#9CA3AF',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  tipsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  findMatchesButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findMatchesButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});