import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { openaiService, ChatMessage } from '../services/openaiService';

interface ChatScreenProps {
  onBack: () => void;
  onOpenSettings: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ onBack, onOpenSettings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Zebra Finance Assistant. I can help you understand your spending habits and provide financial insights. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Check if OpenAI is initialized
    if (!openaiService.isInitialized()) {
      Alert.alert(
        'Setup Required',
        'Please add your OpenAI API key in settings to use the AI assistant.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: onOpenSettings },
        ]
      );
    }
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (!openaiService.isInitialized()) {
      Alert.alert(
        'Setup Required',
        'Please add your OpenAI API key in settings to use the AI assistant.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: onOpenSettings },
        ]
      );
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await openaiService.sendMessage([...messages, userMessage]);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to get AI response'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser && styles.userText]}>{item.content}</Text>
        {item.timestamp && (
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {item.timestamp.toLocaleTimeString('en-ZA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🦓 Zebra Assistant</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#6C63FF" />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about your finances..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || loading}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#6C63FF',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  userText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  userTimestamp: {
    color: '#e0d9ff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
