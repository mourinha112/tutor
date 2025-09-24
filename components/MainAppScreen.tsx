import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/providers/AuthProvider';
import { LoginScreen } from '@/components/LoginScreen';
import { DashboardScreen } from '@/components/DashboardScreen';
import ChatScreen from './chat';

type AppScreen = 'login' | 'dashboard' | 'chat';

export default function MainAppScreen() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLoginSuccess={() => setCurrentScreen('dashboard')} 
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
    
    case 'dashboard':
    default:
      return (
        <DashboardScreen 
          onStartChat={() => setCurrentScreen('chat')} 
        />
      );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});