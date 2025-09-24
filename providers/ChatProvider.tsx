import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type Language = 'Inglês' | 'Espanhol' | 'Francês' | 'Alemão' | 'Italiano' | 'Japonês';

export const [ChatProvider, useChatStore] = createContextHook(() => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('Inglês');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(
    'https://clips-presenters.d-id.com/v2/Adam/36wCtvjdAi/C6evUUgPyQ/talkingPreview.mp4'
  );

  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      const [messagesData, languageData, avatarData] = await Promise.all([
        AsyncStorage.getItem('chat_messages'),
        AsyncStorage.getItem('selected_language'),
        AsyncStorage.getItem('selected_avatar_url'),
      ]);
      
      if (messagesData) {
        const parsedMessages = JSON.parse(messagesData).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      }
      
      if (languageData) {
        setSelectedLanguage(languageData as Language);
      }
      if (avatarData) {
        setSelectedAvatarUrl(avatarData);
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = useCallback((language: Language) => {
    if (!language?.trim() || language.length > 50) return;
    const sanitized = language.trim();
    setSelectedLanguage(sanitized as Language);
    AsyncStorage.setItem('selected_language', sanitized);
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const newMessages = [...prev, message];
      AsyncStorage.setItem('chat_messages', JSON.stringify(newMessages));
      return newMessages;
    });
  }, []);
  
  const setAvatarUrl = useCallback((url: string) => {
    if (!url?.trim() || url.length > 2048) return;
    const sanitized = url.trim();
    setSelectedAvatarUrl(sanitized);
    AsyncStorage.setItem('selected_avatar_url', sanitized);
  }, []);
  
  const clearMessagesMemo = useCallback(() => {
    setMessages([]);
    AsyncStorage.removeItem('chat_messages');
  }, []);

  return useMemo(() => ({
    messages,
    selectedLanguage,
    isLoading,
    addMessage,
    clearMessages: clearMessagesMemo,
    setLanguage,
    selectedAvatarUrl,
    setAvatarUrl,
  }), [messages, selectedLanguage, isLoading, addMessage, clearMessagesMemo, setLanguage, selectedAvatarUrl, setAvatarUrl]);
});