import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Send, ArrowLeft } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '@/providers/ChatProvider';
import { useAuthStore } from '@/providers/AuthProvider';
import { Avatar } from '@/components/Avatar';
import { AvatarSelectScreen } from '@/components/AvatarSelectScreen';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LoginScreen } from '@/components/LoginScreen';
import { RegisterScreen } from '@/components/RegisterScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import { LevelingScreen } from '@/components/LevelingScreen';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type AppScreen = 'login' | 'register' | 'dashboard' | 'avatar-select' | 'chat' | 'leveling';

export default function MainApp() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    // If user requested registration, show register screen even when not authenticated
    if (currentScreen === 'register') {
      return (
        <RegisterScreen
          onRegisterSuccess={() => setCurrentScreen('dashboard')}
        />
      );
    }

    return (
      <LoginScreen 
        onLoginSuccess={() => setCurrentScreen('dashboard')}
        onNavigateToRegister={() => setCurrentScreen('register')}
      />
    );
  }

  // Show appropriate screen based on current state
  switch (currentScreen) {
    case 'chat':
      return (
        <ChatScreen 
          onBackToDashboard={() => setCurrentScreen('dashboard')} 
        />
      );
    case 'avatar-select':
      return (
        <AvatarSelectScreen
          onBack={() => setCurrentScreen('dashboard')}
          onConfirm={() => setCurrentScreen('chat')}
        />
      );
    case 'register':
      return (
        <RegisterScreen
          onRegisterSuccess={() => setCurrentScreen('dashboard')}
        />
      );
    
    case 'leveling':
      return (
        <LevelingScreen 
          onBack={(level) => {
            console.log('User level assessed:', level);
            setCurrentScreen('dashboard');
          }} 
        />
      );
    case 'dashboard':
    default:
      return (
        <DashboardScreen 
          onStartChat={() => setCurrentScreen('avatar-select')} 
          onStartLeveling={() => setCurrentScreen('leveling')}
        />
      );
  }
}

interface ChatScreenProps {
  onBackToDashboard: () => void;
}

function ChatScreen({ onBackToDashboard }: ChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { messages, selectedLanguage, addMessage, setLanguage, selectedAvatarUrl } = useChatStore();

  const { width: screenWidth } = dimensions;
  const isDesktopView = screenWidth > 768;
  const isTabletView = screenWidth > 600 && screenWidth <= 768;

  useEffect(() => {
    setupAudio();
    
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const showError = (message: string) => {
    if (!message?.trim() || message.length > 200) return;
    const sanitized = message.trim();
    setErrorMessage(sanitized);
    setShowErrorModal(true);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Adiciona mensagem do usuário imediatamente
    addMessage(userMessage);
    setInputText('');

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Aguarda um pouco para garantir que a mensagem foi renderizada
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setIsLoading(true);

    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Você é Sakae, um tutor de idiomas especializado em ${selectedLanguage}. 

IMPORTANTE SOBRE IDIOMAS:
- Responda SEMPRE em português brasileiro para explicações, instruções e conversas gerais
- Use ${selectedLanguage} APENAS quando estiver dando exemplos específicos ou ensinando pronúncia
- Quando ensinar uma palavra/frase em ${selectedLanguage}, fale primeiro em português e depois dê o exemplo

EXEMPLO CORRETO:
Usuário: "Como falo oi tudo bem em inglês?"
Você: "Para dizer oi tudo bem em inglês, você pode falar: Hello, how are you?"

REGRAS:
- Seja direto e natural, como um professor humano
- NÃO use asteriscos, hashtags ou formatação especial
- Mantenha respostas concisas e didáticas
- Use voz masculina e tom amigável`,
            },
            ...messages.slice(-5).map(msg => ({
              role: msg.isUser ? 'user' : 'assistant',
              content: msg.text,
            })),
            {
              role: 'user',
              content: text.trim(),
            },
          ],
        }),
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.completion,
        isUser: false,
        timestamp: new Date(),
      };

      addMessage(botMessage);
      
      // Scroll para mostrar a resposta do bot
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      await speakText(data.completion);
      
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const detectLanguage = (text: string) => {
    // Palavras comuns em inglês que indicam que está ensinando inglês
    const englishIndicators = [
      'hello', 'hi', 'how are you', 'good morning', 'good afternoon', 'good evening',
      'thank you', 'please', 'excuse me', 'sorry', 'yes', 'no', 'what', 'where',
      'when', 'why', 'how', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'have', 'has', 'had', 'will', 'would', 'could', 'should', 'my', 'your',
      'his', 'her', 'our', 'their', 'this', 'that', 'these', 'those'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Se contém muitas palavras em inglês, provavelmente está ensinando inglês
    const englishWordCount = englishIndicators.filter(word => 
      lowerText.includes(word.toLowerCase())
    ).length;
    
    // Se encontrou 2 ou mais palavras em inglês, considera que está ensinando inglês
    return englishWordCount >= 2 ? 'en-US' : 'pt-BR';
  };

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const detectedLanguage = detectLanguage(text);
      const isEnglish = detectedLanguage === 'en-US';
      
      if (Platform.OS === 'web') {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = detectedLanguage;
        
        // Aguardar vozes carregarem se necessário
        const loadVoices = () => {
          const voices = speechSynthesis.getVoices();
          
          if (isEnglish) {
            // Para inglês: buscar voz nativa americana ou britânica
            const nativeEnglishVoice = voices.find(voice => 
              (voice.lang.includes('en-US') || voice.lang.includes('en-GB')) &&
              (voice.name.toLowerCase().includes('male') || 
               voice.name.toLowerCase().includes('david') ||
               voice.name.toLowerCase().includes('daniel') ||
               voice.name.toLowerCase().includes('ryan'))
            ) || voices.find(voice => 
              voice.lang.includes('en-US') || voice.lang.includes('en-GB')
            );
            
            if (nativeEnglishVoice) {
              utterance.voice = nativeEnglishVoice;
              utterance.pitch = 0.8;
              utterance.rate = 0.9;
            }
          } else {
            // Para português: buscar voz masculina brasileira
            const malePortugueseVoice = voices.find(voice => 
              (voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR')) &&
              (voice.name.toLowerCase().includes('male') || 
               voice.name.toLowerCase().includes('masculin') ||
               voice.name.toLowerCase().includes('ricardo') ||
               voice.name.toLowerCase().includes('felipe'))
            ) || voices.find(voice => 
              voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR')
            );
            
            if (malePortugueseVoice) {
              utterance.voice = malePortugueseVoice;
              utterance.pitch = 0.7; // Tom mais grave para voz masculina
              utterance.rate = 0.85; // Velocidade mais natural
            }
          }
        };
        
        if (speechSynthesis.getVoices().length === 0) {
          speechSynthesis.onvoiceschanged = loadVoices;
        } else {
          loadVoices();
        }
        
        utterance.volume = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      } else {
        // Use expo-speech for mobile
        const speechOptions = {
          language: detectedLanguage,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        };

        if (isEnglish) {
          // Configurações para inglês nativo
          await Speech.speak(text, {
            ...speechOptions,
            language: 'en-US',
            pitch: 0.8,
            rate: 0.9,
            voice: 'com.apple.ttsbundle.Daniel-compact', // Voz masculina americana (iOS)
          });
        } else {
          // Configurações para português brasileiro masculino
          await Speech.speak(text, {
            ...speechOptions,
            language: 'pt-BR',
            pitch: 0.7, // Tom mais grave para voz masculina
            rate: 0.85, // Velocidade mais natural
            voice: 'com.apple.ttsbundle.Luciana-compact', // Melhor voz brasileira disponível
          });
        }
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsSpeaking(false);
    }
  };



  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        showError('Gravação de áudio não está disponível na web ainda.');
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

      setRecording(recording);
      setIsRecording(true);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error starting recording:', error);
      showError('Não foi possível iniciar a gravação.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      if (!uri) return;

      const formData = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const audioFile = {
        uri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`,
      } as any;

      formData.append('audio', audioFile);

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.text) {
        setInputText(data.text);
      }

      setRecording(null);
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      showError('Não foi possível processar a gravação.');
      setRecording(null);
      setIsRecording(false);
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={[
        styles.messageText,
        message.isUser ? styles.userMessageText : styles.botMessageText,
      ]}>
        {message.text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <View style={[
          styles.headerContent,
          isDesktopView && styles.desktopHeaderContent,
          isTabletView && styles.tabletHeaderContent
        ]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBackToDashboard}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sakae - Tutor de Idiomas</Text>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setLanguage}
          />
        </View>
      </LinearGradient>

      <View style={[
        styles.chatContainer,
        isDesktopView && styles.desktopChatContainer,
        isTabletView && styles.tabletChatContainer
      ]}>
  <Avatar isSpeaking={isSpeaking} videoUrl={selectedAvatarUrl} />
        
        <ScrollView
          ref={scrollViewRef}
          style={[
            styles.messagesContainer,
            isDesktopView && styles.desktopMessagesContainer,
            isTabletView && styles.tabletMessagesContainer
          ]}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 50);
          }}
          onLayout={() => {
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 100);
          }}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeMessage}>
              <Text style={styles.welcomeText}>
                Olá! Sou seu tutor de IA. Escolha um idioma acima e vamos começar a praticar!
              </Text>
            </View>
          )}
          
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={styles.chatLoadingContainer}>
              <Text style={styles.chatLoadingText}>Sakae está digitando...</Text>
            </View>
          )}
        </ScrollView>

        <View style={[
          styles.inputContainer, 
          { paddingBottom: insets.bottom + 20 },
          isDesktopView && styles.desktopInputContainer,
          isTabletView && styles.tabletInputContainer
        ]}>
          <TextInput
            style={[
              styles.textInput,
              isDesktopView && styles.desktopTextInput,
              isTabletView && styles.tabletTextInput
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Digite sua mensagem ou use o microfone..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            <Mic color={isRecording ? '#fff' : '#6366f1'} size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Send color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Erro</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  chatLoadingContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  chatLoadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic' as const,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    flex: 1,
    textAlign: 'center' as const,
    marginHorizontal: 16,
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  welcomeMessage: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  welcomeText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 22,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#475569',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f8fafc',
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    textAlign: 'center',
    marginBottom: 12,
    color: '#1f2937',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#374151',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  // Responsive Styles
  desktopHeaderContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  tabletHeaderContent: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  desktopChatContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  tabletChatContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  desktopMessagesContainer: {
    paddingHorizontal: 40,
  },
  tabletMessagesContainer: {
    paddingHorizontal: 30,
  },
  desktopInputContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  tabletInputContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  desktopTextInput: {
    fontSize: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabletTextInput: {
    fontSize: 17,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
});