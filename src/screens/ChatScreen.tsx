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
import { LinearGradient } from 'expo-linear-gradient';
import { openaiService, ChatMessage } from '../services/openaiService';
import { theme } from '../theme/colors';

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
      <LinearGradient
        colors={isUser ? [theme.accent.primary, theme.accent.secondary] : theme.gradients.card}
        style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}
      >
        <Text style={[styles.messageText, isUser && styles.userText]}>{item.content}</Text>
        {item.timestamp && (
          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {item.timestamp.toLocaleTimeString('en-ZA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </LinearGradient>
    );
  };

  return (
    <LinearGradient colors={theme.gradients.primary} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <LinearGradient colors={theme.gradients.secondary} style={styles.header}>
          <Text style={styles.title}>🦓 Zebra Assistant</Text>
        </LinearGradient>

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
            <ActivityIndicator color={theme.accent.primary} />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about your finances..."
            placeholderTextColor={theme.text.tertiary}
            multiline
            maxLength={500}
          />
          <LinearGradient
            colors={[theme.accent.primary, theme.accent.secondary]}
            style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          >
            <TouchableOpacity
              style={styles.sendButtonInner}
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: theme.text.secondary,
    lineHeight: 22,
  },
  userText: {
    color: theme.text.primary,
  },
  timestamp: {
    fontSize: 11,
    color: theme.text.tertiary,
    marginTop: 6,
  },
  userTimestamp: {
    color: theme.text.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: theme.text.secondary,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.background.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.border.primary,
  },
  input: {
    flex: 1,
    backgroundColor: theme.background.input,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
    color: theme.text.primary,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: theme.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
