import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '@/providers/ChatProvider';
import { Avatar } from '@/components/Avatar';

interface AvatarSelectScreenProps {
  onBack: () => void;
  onConfirm: () => void;
}

const AVATARS = [
  {
    id: 'adam',
    label: 'Adam',
    url: 'https://clips-presenters.d-id.com/v2/Adam/36wCtvjdAi/C6evUUgPyQ/talkingPreview.mp4',
  },
  {
    id: 'anita',
    label: 'Anita',
    url: 'https://clips-presenters.d-id.com/v2/anita/ReIUkBUDQG/VnDASr_Og2/anita_talking_preview_video_video.mp4',
  },
];

export function AvatarSelectScreen({ onBack, onConfirm }: AvatarSelectScreenProps) {
  const insets = useSafeAreaInsets();
  const { selectedAvatarUrl, setAvatarUrl } = useChatStore();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  const { width: screenWidth } = dimensions;
  const isDesktopView = screenWidth > 768;
  const isTabletView = screenWidth > 600 && screenWidth <= 768;

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setDimensions(window));
    return () => sub?.remove();
  }, []);

  const isSelected = (url: string) => selectedAvatarUrl === url;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escolha seu Avatar</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <View style={[styles.grid, isDesktopView && styles.gridDesktop, isTabletView && styles.gridTablet]}>
        {AVATARS.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[styles.card, isSelected(a.url) && styles.cardSelected]}
            onPress={() => setAvatarUrl(a.url)}
            activeOpacity={0.9}
          >
            <View style={styles.avatarWrapper}>
              <Avatar isSpeaking={false} videoUrl={a.url} variant="inline" size={160} />
            </View>
            <Text style={styles.cardLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, !selectedAvatarUrl && styles.confirmDisabled]}
        onPress={onConfirm}
        disabled={!selectedAvatarUrl}
      >
        <Text style={styles.confirmText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  grid: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    alignContent: 'flex-start',
    justifyContent: 'center',
  },
  gridDesktop: { maxWidth: 1200, alignSelf: 'center', width: '100%' },
  gridTablet: { maxWidth: 800, alignSelf: 'center', width: '100%' },

  card: {
    width: 280,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardSelected: { borderWidth: 2, borderColor: '#6366f1' },
  avatarWrapper: { height: 220, justifyContent: 'center', alignItems: 'center' },
  cardLabel: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#334155' },

  confirmButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  confirmDisabled: { backgroundColor: '#cbd5e1' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
