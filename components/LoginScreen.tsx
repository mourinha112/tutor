import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, User, Lock, BookOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/providers/AuthProvider';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister?: () => void;
}

export function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMockCredentials, setShowMockCredentials] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width: screenWidth } = dimensions;
  const isDesktopView = screenWidth > 768;
  const isTabletView = screenWidth > 600 && screenWidth <= 768;
  
  const insets = useSafeAreaInsets();
  const { login, mockUsers } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login({ email: email.trim(), password });

      if (result && result.success) {
        onLoginSuccess();
      } else {
        const message = result && result.message ? result.message : 'Email ou senha incorretos. Tente usar uma das contas de demonstração.';
        Alert.alert('Erro de Login', message, [
          { text: 'OK' },
          { text: 'Ver Contas Demo', onPress: () => setShowMockCredentials(true) }
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Algo deu errado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillMockCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('123456');
    setShowMockCredentials(false);
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#ec4899']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Container responsivo */}
          <View style={[
            styles.contentContainer,
            isDesktopView && styles.desktopContainer,
            isTabletView && styles.tabletContainer
          ]}>
            {/* Header */}
            <View style={styles.header}>
            <View style={styles.logoContainer}>
              <BookOpen color="#fff" size={48} />
            </View>
            <Text style={styles.title}>Sakae Tutor</Text>
            <Text style={styles.subtitle}>Aprenda idiomas com IA</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.form}>
              <Text style={styles.formTitle}>Entrar na sua conta</Text>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <User color="#6b7280" size={20} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputIcon}>
                  <Lock color="#6b7280" size={20} />
                </View>
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="Senha"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff color="#6b7280" size={20} />
                  ) : (
                    <Eye color="#6b7280" size={20} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              {/* Demo Accounts Button */}
              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => setShowMockCredentials(!showMockCredentials)}
              >
                <Text style={styles.demoButtonText}>
                  📋 {showMockCredentials ? 'Ocultar' : 'Contas de Demonstração'}
                </Text>
              </TouchableOpacity>

              {/* Create account link */}
              {typeof onNavigateToRegister === 'function' && (
                <TouchableOpacity style={styles.createAccountButton} onPress={onNavigateToRegister}>
                  <Text style={styles.createAccountText}>Criar conta</Text>
                </TouchableOpacity>
              )}

              {/* Mock Credentials */}
              {showMockCredentials && (
                <View style={styles.mockCredentialsContainer}>
                  <Text style={styles.mockTitle}>Contas para teste:</Text>
                  {mockUsers.map((user, index) => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.mockUserCard}
                      onPress={() => fillMockCredentials(user.email)}
                    >
                      <View>
                        <Text style={styles.mockUserName}>{user.name}</Text>
                        <Text style={styles.mockUserEmail}>{user.email}</Text>
                        <Text style={styles.mockUserLevel}>Nível: {user.level}</Text>
                      </View>
                      <View style={styles.mockUserStats}>
                        <Text style={styles.mockUserXP}>{user.xp} XP</Text>
                        <Text style={styles.mockUserStreak}>🔥 {user.streak}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.mockPassword}>🔑 Senha para todas: 123456</Text>
                </View>
              )}
            </View>
          </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  form: {
    width: '100%',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    padding: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 16,
    paddingRight: 16,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  demoButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  createAccountButton: {
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
  },
  createAccountText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  mockCredentialsContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  mockTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  mockUserCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mockUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  mockUserEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  mockUserLevel: {
    fontSize: 11,
    color: '#6366f1',
    marginTop: 2,
  },
  mockUserStats: {
    alignItems: 'flex-end',
  },
  mockUserXP: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  mockUserStreak: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 2,
  },
  mockPassword: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Responsive Styles
  contentContainer: {
    flex: 1,
  },
  desktopContainer: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  tabletContainer: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
});