import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MessageCircle, 
  BookOpen, 
  Trophy, 
  Flame, 
  User, 
  LogOut,
  Play,
  Clock,
  Target,
  TrendingUp,
  Star,
  Calendar,
  Award,
  Zap,
  Crown,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/providers/AuthProvider';
import { apiPost } from '@/config/api';
import { LessonProgress } from '@/components/CircularProgress';
import { StreakFlame, StreakCard } from '@/components/StreakFlame';
import { Avatar } from '@/components/Avatar';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  onStartChat: () => void;
  onStartLeveling: () => void;
}

export function DashboardScreen({ onStartChat, onStartLeveling }: DashboardScreenProps) {
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
  const { user, logout } = useAuthStore();

  const [serverLessons, setServerLessons] = useState<typeof lessons | null>(null);
  const [serverAchievements, setServerAchievements] = useState<typeof achievements | null>(null);
  const [serverStats, setServerStats] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (!user) return;
      try {
  const resp = await apiPost('backend/dashboard.php', { userId: user.id });
        if (!mounted) return;
        if (resp && resp.success) {
          setServerLessons(resp.lessons || []);
          setServerAchievements(resp.achievements || []);
          setServerStats(resp.stats || null);
        }
      } catch (err) {
        console.warn('Failed to load dashboard data:', err);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, [user]);

  // Lesson data
  const lessons = [
    { id: 1, title: 'Básico 1', progress: 75, completed: false, locked: false },
    { id: 2, title: 'Saudações', progress: 0, completed: false, locked: true },
    { id: 3, title: 'Família', progress: 0, completed: false, locked: true },
    { id: 4, title: 'Números', progress: 0, completed: false, locked: true },
  ];

  // Achievement data
  const achievements = [
    { id: 1, title: 'Primeira Lição', icon: '🎯', unlocked: true },
    { id: 2, title: 'Sequência de 3', icon: '🔥', unlocked: true },
    { id: 3, title: 'Estudioso', icon: '📚', unlocked: false },
    { id: 4, title: 'Campeão', icon: '👑', unlocked: false },
  ];

  // Calculate level and progress
  const currentLevel = Math.floor((user?.xp || 0) / 500) + 1;
  const xpInCurrentLevel = (user?.xp || 0) % 500;
  const progressToNextLevel = (xpInCurrentLevel / 500) * 100;

  // Stats
  const lessonsCompleted = 5;
  const hoursStudied = Math.floor((user?.xp || 0) / 100);

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* Container responsivo */}
      <View style={[
        styles.contentContainer,
        isDesktopView && styles.desktopContainer,
        isTabletView && styles.tabletContainer
      ]}>
        {/* Header Duolingo Style */}
        <LinearGradient
          colors={['#93c5fd', '#3b82f6']}
          style={[
            styles.duolingoHeader,
            isDesktopView && styles.desktopHeader,
            isTabletView && styles.tabletHeader
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
              <View style={[styles.greetingText, { marginLeft: 0 }]}>
                <Text style={styles.duolingoGreeting}>
                  Olá, {user?.name || 'Estudante'}!
                </Text>
                <Text style={styles.duolingoSubtitle}>
                  Pronto para aprender hoje?
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.duolingoLogout} onPress={logout}>
              <LogOut color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          {/* XP Progress Section */}
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <View style={styles.levelBadge}>
                <Crown color="#fff" size={16} />
                <Text style={styles.levelNumber}>{currentLevel}</Text>
              </View>
              <Text style={styles.xpText}>{user?.xp || 0} XP</Text>
            </View>
            
            <View style={styles.xpBarContainer}>
              <View style={styles.xpBarBg}>
                <LinearGradient
                  colors={['#ffd700', '#ffed4a']}
                  style={[styles.xpBarFill, { width: `${progressToNextLevel}%` }]}
                />
              </View>
              <Text style={styles.xpProgressText}>
                {Math.floor(progressToNextLevel)}% para nível {currentLevel + 1}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Streak Card */}
        <View style={[
          styles.streakSection,
          isDesktopView && styles.desktopSection,
          isTabletView && styles.tabletSection
        ]}>
          <View style={styles.streakCardBlue}>
            <View style={styles.streakIconCircle}>
              <Flame color="#3b82f6" size={28} />
            </View>
            <View style={styles.streakTextArea}>
              <Text style={styles.streakTitleBlue}>Sequência incrível!</Text>
              <Text style={styles.streakTextBlue}>{user?.streak || 0} dias de sequência</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={[
          styles.quickStats,
          isDesktopView && styles.desktopSection,
          isTabletView && styles.tabletSection
        ]}>
          <View style={styles.statItem}>
            <View style={styles.statIconCircle}>
              <Trophy color="#3b82f6" size={20} />
            </View>
            <Text style={styles.statValueBlue}>{lessonsCompleted}</Text>
            <Text style={styles.statLabelBlue}>Lições</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconCircle}>
              <Clock color="#3b82f6" size={20} />
            </View>
            <Text style={styles.statValueBlue}>{hoursStudied}</Text>
            <Text style={styles.statLabelBlue}>Horas</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconCircle}>
              <Target color="#3b82f6" size={20} />
            </View>
            <Text style={styles.statValueBlue}>75%</Text>
            <Text style={styles.statLabelBlue}>Meta</Text>
          </View>
        </View>

        {/* Lessons Section */}
        <View style={[
          styles.section,
          isDesktopView && styles.desktopSection,
          isTabletView && styles.tabletSection
        ]}>
          <Text style={styles.duolingoSectionTitle}>📚 Suas Lições</Text>
          <View style={styles.lessonsGrid}>
            {(serverLessons ?? lessons).map((lesson: any) => (
              <TouchableOpacity
                key={lesson.id}
                onPress={() => lesson.id === 1 ? onStartChat() : console.log('Start lesson', lesson.id)}
                disabled={lesson.locked}
              >
                <LessonProgress
                  progress={lesson.progress}
                  lesson={lesson.title}
                  isCompleted={lesson.completed}
                  isLocked={lesson.locked}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievements Section */}
        <View style={[
          styles.section,
          isDesktopView && styles.desktopSection,
          isTabletView && styles.tabletSection
        ]}>
          <Text style={styles.duolingoSectionTitle}>🏆 Conquistas</Text>
          <View style={styles.achievementsGrid}>
            {(serverAchievements ?? achievements).map((achievement: any) => (
              <View
                key={achievement.id}
                style={[styles.achievementCardBlue, { opacity: achievement.unlocked ? 1 : 0.4 }, isDesktopView && styles.desktopAchievementCard, isTabletView && styles.tabletAchievementCard]}
              >
                <Text style={styles.achievementIconBlue}>{achievement.icon || '🏅'}</Text>
                <Text style={styles.achievementTitleBlue}>{achievement.title}</Text>
                {achievement.unlocked && (
                  <View style={styles.unlockedBadgeBlue}>
                    <Text style={styles.unlockedTextBlue}>✓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
        {/* Quick Actions Duolingo Style */}
        <View style={[
          styles.section,
          isDesktopView && styles.desktopSection,
          isTabletView && styles.tabletSection
        ]}>
          <Text style={styles.duolingoSectionTitle}>⚡ Ações Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[
                styles.quickActionCard, 
                { backgroundColor: '#1cb0f6' },
                isDesktopView && styles.desktopQuickActionCard,
                isTabletView && styles.tabletQuickActionCard
              ]}
              onPress={onStartChat}
            >
              <MessageCircle color="#fff" size={32} />
              <Text style={styles.quickActionTitle}>Conversar</Text>
              <Text style={styles.quickActionSubtitle}>com Sakae</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.quickActionCard, 
                { backgroundColor: '#58cc02' },
                isDesktopView && styles.desktopQuickActionCard,
                isTabletView && styles.tabletQuickActionCard
              ]}
              onPress={() => console.log('Quick lesson')}
            >
              <Zap color="#fff" size={32} />
              <Text style={styles.quickActionTitle}>Lição</Text>
              <Text style={styles.quickActionSubtitle}>Rápida</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.quickActionCard, 
                { backgroundColor: '#ce82ff' },
                isDesktopView && styles.desktopQuickActionCard,
                isTabletView && styles.tabletQuickActionCard
              ]}
              onPress={() => console.log('Vocabulary')}
            >
              <BookOpen color="#fff" size={32} />
              <Text style={styles.quickActionTitle}>Vocabulário</Text>
              <Text style={styles.quickActionSubtitle}>Revisar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.quickActionCard, 
                { backgroundColor: '#ff6b35' },
                isDesktopView && styles.desktopQuickActionCard,
                isTabletView && styles.tabletQuickActionCard
              ]}
              onPress={() => console.log('Pronunciation')}
            >
              <TrendingUp color="#fff" size={32} />
              <Text style={styles.quickActionTitle}>Pronúncia</Text>
              <Text style={styles.quickActionSubtitle}>Praticar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.quickActionCard, 
                { backgroundColor: '#ff9500' },
                isDesktopView && styles.desktopQuickActionCard,
                isTabletView && styles.tabletQuickActionCard
              ]}
              onPress={onStartLeveling}
            >
              <Avatar 
                videoUrl="https://clips-presenters.d-id.com/v2/darren/JgxEH6fBQJ/xMuAGiEaQN/darren_talking_preview_video.mp4"
                isSpeaking={false}
                variant="inline"
                size={60}
              />
              <Text style={styles.quickActionTitle}>Nivelamento</Text>
              <Text style={styles.quickActionSubtitle}>Teste seu nível</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: insets.bottom + 20 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  streakCardBlue: {
    backgroundColor: '#e0e7ff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  streakIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakTextArea: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  streakTitleBlue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 2,
  },
  streakTextBlue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValueBlue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 2,
  },
  statLabelBlue: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  achievementCardBlue: {
    width: (width - 64) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIconBlue: {
    fontSize: 32,
    marginBottom: 8,
    color: '#3b82f6',
  },
  achievementTitleBlue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
  },
  unlockedBadgeBlue: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedTextBlue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  xpBarBgBlue: {
    height: 12,
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBarFillBlue: {
    height: '100%',
    borderRadius: 6,
  },
  xpProgressTextBlue: {
    fontSize: 12,
    color: '#3b82f6',
    textAlign: 'center',
    fontWeight: '500',
  },
  // (streakCardBlue and streakTextBlue defined earlier)
  container: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  // Responsive Styles
  contentContainer: {
    flex: 1,
  },
  desktopContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  tabletContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  // Duolingo Header Styles
  duolingoHeader: {
    padding: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  desktopHeader: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 40,
  },
  tabletHeader: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greetingText: {
    marginLeft: 16,
    flex: 1,
  },
  duolingoGreeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  duolingoSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  duolingoLogout: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // XP Section
  xpSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  xpBarContainer: {
    gap: 8,
  },
  xpBarBg: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  xpProgressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Streak Section
  streakSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#8a8a8a',
    fontWeight: '500',
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  desktopSection: {
    paddingHorizontal: 40,
  },
  tabletSection: {
    paddingHorizontal: 30,
  },
  duolingoSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: 16,
  },
  // Lessons Grid
  lessonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  // Achievements
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (width - 64) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Responsive Grid Styles
  desktopAchievementCard: {
    width: '23%', // 4 cards per row on desktop
    minWidth: 200,
  },
  tabletAchievementCard: {
    width: '31%', // 3 cards per row on tablet
    minWidth: 160,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a4a4a',
    textAlign: 'center',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#58cc02',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  desktopQuickActionCard: {
    width: '23%', // 4 cards per row on desktop
    minWidth: 200,
  },
  tabletQuickActionCard: {
    width: '48%', // 2 cards per row on tablet
    minWidth: 180,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});