import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StreakFlameProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
}

export function StreakFlame({ streak, size = 'medium' }: StreakFlameProps) {
  const flameAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const flameAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(flameAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (streak > 0) {
      flameAnimation.start();
      glowAnimation.start();
    } else {
      flameAnimation.stop();
      glowAnimation.stop();
    }

    return () => {
      flameAnimation.stop();
      glowAnimation.stop();
    };
  }, [streak, flameAnim, glowAnim]);

  const getFlameSize = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 80;
      default:
        return 60;
    }
  };

  const flameSize = getFlameSize();

  if (streak === 0) {
    return (
      <View style={[styles.container, { width: flameSize, height: flameSize }]}>
        <View style={[styles.extinguishedFlame, { width: flameSize * 0.8, height: flameSize * 0.8 }]}>
          <Text style={styles.extinguishedEmoji}>❄️</Text>
        </View>
        <Text style={styles.streakText}>0</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: flameSize, height: flameSize }]}>
      {/* Glow Effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            width: flameSize * 1.4,
            height: flameSize * 1.4,
            opacity: glowAnim,
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', '#ff6b35', 'transparent']}
          style={styles.glowGradient}
        />
      </Animated.View>

      {/* Main Flame */}
      <Animated.View
        style={[
          styles.flame,
          {
            width: flameSize,
            height: flameSize,
            transform: [{ scale: flameAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#ff6b35', '#f7931e', '#ffd23f']}
          style={styles.flameGradient}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
        >
          <Text style={[styles.flameEmoji, { fontSize: flameSize * 0.6 }]}>
            🔥
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Streak Number */}
      <View style={styles.streakBadge}>
        <Text style={styles.streakText}>{streak}</Text>
      </View>
    </View>
  );
}

interface StreakCardProps {
  streak: number;
  title?: string;
}

export function StreakCard({ streak, title = "Sequência" }: StreakCardProps) {
  const getMotivationalMessage = () => {
    if (streak === 0) return "Comece sua sequência!";
    if (streak < 7) return "Continue assim!";
    if (streak < 30) return "Incrível! 🎉";
    if (streak < 100) return "Você é demais! 🚀";
    return "Lendário! 👑";
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={streak > 0 ? ['#ff6b35', '#f7931e'] : ['#e0e0e0', '#bdbdbd']}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          <StreakFlame streak={streak} size="large" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardMessage}>{getMotivationalMessage()}</Text>
            {streak > 0 && (
              <Text style={styles.cardSubtext}>
                {streak === 1 ? '1 dia' : `${streak} dias`} consecutivos
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  flame: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  flameGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flameEmoji: {
    textAlign: 'center',
  },
  extinguishedFlame: {
    backgroundColor: '#e0e0e0',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extinguishedEmoji: {
    fontSize: 24,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#ff6b35',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  cardContainer: {
    margin: 8,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});