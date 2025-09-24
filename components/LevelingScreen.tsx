import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Send, ArrowLeft } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const ConfettiEffect = () => {
  const confettiItems = Array.from({ length: 20 }, (_, i) => i);
  const animations = useRef(confettiItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animateConfetti = () => {
      animations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000 + Math.random() * 1000,
          delay: index * 50,
          useNativeDriver: true,
        }).start();
      });
    };
    animateConfetti();
  }, []);

  return (
    <View style={styles.confettiContainer}>
      {confettiItems.map((item, index) => (
        <Animated.View
          key={item}
          style={[
            styles.confettiPiece,
            {
              left: Math.random() * Dimensions.get('window').width,
              backgroundColor: ['#ff6b35', '#f7931e', '#ffd23f', '#06ffa5', '#3b82f6'][Math.floor(Math.random() * 5)],
              transform: [
                { rotate: `${Math.random() * 360}deg` },
                {
                  translateY: animations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, Dimensions.get('window').height + 50],
                  }),
                },
                {
                  translateX: animations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, (Math.random() - 0.5) * 200],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

interface LevelingScreenProps {
  onBack: (level?: string) => void;
}

export function LevelingScreen({ onBack }: LevelingScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [userLevel, setUserLevel] = useState<string>('Básico');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLevelUpAlert, setShowLevelUpAlert] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<string>('Básico');
  const scrollViewRef = useRef<ScrollView>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const isDesktopView = width > 768;

  const professorUrl = 'https://clips-presenters.d-id.com/v2/darren/JgxEH6fBQJ/xMuAGiEaQN/darren_talking_preview_video.mp4';

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Initialize with professor's greeting
    setMessages([{
      id: '1',
      text: 'Olá! Eu sou o Professor Darren. Vamos começar o teste de nivelamento. Me diga algo sobre você em inglês.',
      isUser: false,
      timestamp: new Date(),
    }]);
  }, []);

  const analyzeEnglish = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const hasEnglishWords = /\b(the|and|is|you|i|to|of|a|in|that|it|with|for|on|are|be|this|have|from|or|one|had|by|word|but|not|what|all|were|we|when|your|can|said|there|use|an|each|which|she|do|how|their|if|will|up|other|about|out|many|then|them|these|so|some|her|would|make|like|him|into|time|has|look|two|more|write|go|see|number|no|way|could|people|my|than|first|water|been|call|who|oil|its|now|find|long|down|day|did|get|come|made|may|part)\b/i.test(text);
    const hasGrammar = /[.!?]$/.test(text.trim());
    
    let level = 'Básico';
    if (words > 10 && hasEnglishWords && hasGrammar) {
      level = 'Intermediário';
    } else if (words > 20 && hasEnglishWords) {
      level = 'Avançado';
    }
    
    return { level, words, hasEnglishWords, hasGrammar };
  };

  const speakNaturalText = async (text: string) => {
    // Split text into sentences for better intonation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (sentence) {
        await new Promise<void>((resolve) => {
          Speech.speak(sentence, {
            language: 'pt-BR',
            voice: 'pt-BR-male',
            rate: 0.7,
            pitch: 0.4,
            onDone: () => resolve(),
          });
        });
        // Add pause between sentences
        if (i < sentences.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Analyze the message and update level
    const analysis = analyzeEnglish(text.trim());
    const levelOrder = { 'Básico': 1, 'Intermediário': 2, 'Avançado': 3 };
    const newLevel = analysis.level;
    const oldLevelValue = levelOrder[previousLevel as keyof typeof levelOrder] || 1;
    const newLevelValue = levelOrder[newLevel as keyof typeof levelOrder] || 1;
    
    if (newLevelValue > oldLevelValue) {
      setShowConfetti(true);
      setShowLevelUpAlert(true);
      setTimeout(() => setShowConfetti(false), 5000);
      setTimeout(() => setShowLevelUpAlert(false), 4000);
    }
    
    setUserLevel(newLevel);
    setPreviousLevel(newLevel);
    
    // Simulate professor response with feedback
    setTimeout(() => {
      let response = '';
      if (analysis.hasEnglishWords) {
        response = `Bom trabalho! Você escreveu ${analysis.words} palavras. `;
        if (analysis.hasGrammar) {
          response += 'Sua gramática está boa. ';
        } else {
          response += 'Tente terminar suas frases com pontuação. ';
        }
        response += `Seu nível parece ser ${analysis.level}. Continue!`;
      } else {
        response = 'Parece que sua mensagem não está em inglês. Tente escrever em inglês para o teste.';
      }
      
      const professorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, professorMessage]);
      setIsSpeaking(true);
      speakNaturalText(response).then(() => {
        setIsSpeaking(false);
      });
    }, 1000);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, just simulate
        sendMessage('Mensagem de voz (web)');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      recordingRef.current = recording;
      setIsRecording(true);

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      // For demo, just send a placeholder text
      sendMessage('Mensagem de voz (simulada)');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Level Up Alert */}
      {showLevelUpAlert && (
        <View style={styles.levelUpAlert}>
          <Text style={styles.levelUpText}>🎉 Você subiu para {userLevel}! 🎉</Text>
        </View>
      )}

      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => onBack(userLevel)} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Avatar 
          videoUrl={professorUrl}
          isSpeaking={isSpeaking}
          variant="inline"
          size={120}
        />
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.professorNameContainer}>
        <Text style={styles.professorName}>Professor Darren</Text>
      </View>

      <View style={styles.chatContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userMessage : styles.professorMessage,
              ]}
            >
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.professorMessageText,
              ]}>
                {message.text}
              </Text>
              <Text style={[
                styles.timestamp,
                message.isUser ? styles.userTimestamp : styles.professorTimestamp,
              ]}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 10 : 10 }]}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem em inglês..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(inputText)}
          />
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Mic color={isRecording ? '#ff4444' : '#667eea'} size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Send color={inputText.trim() ? '#667eea' : '#ccc'} size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  professorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#667eea',
  },
  professorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  professorMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  professorTimestamp: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recordingButton: {
    backgroundColor: '#ffdddd',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  professorNameContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  levelUpAlert: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1000,
  },
  levelUpText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 999,
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});