import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MascotProps {
  mood?: 'happy' | 'excited' | 'encouraging';
  size?: 'small' | 'medium' | 'large';
}

export function SakaeMascot({ mood = 'happy', size = 'medium' }: MascotProps) {
  const sizeMap = {
    small: 60,
    medium: 80,
    large: 100,
  };

  const containerSize = sizeMap[size];
  const eyeSize = size === 'small' ? 8 : size === 'medium' ? 10 : 12;

  const getMoodEmoji = () => {
    switch (mood) {
      case 'excited':
        return '🤩';
      case 'encouraging':
        return '😊';
      default:
        return '😄';
    }
  };

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <LinearGradient
        colors={['#58cc02', '#46a302']}
        style={[styles.mascotBody, { width: containerSize, height: containerSize }]}
      >
        {/* Face */}
        <View style={styles.face}>
          {/* Eyes */}
          <View style={styles.eyesContainer}>
            <View style={[styles.eye, { width: eyeSize, height: eyeSize }]}>
              <View style={[styles.eyePupil, { width: eyeSize * 0.6, height: eyeSize * 0.6 }]} />
            </View>
            <View style={[styles.eye, { width: eyeSize, height: eyeSize }]}>
              <View style={[styles.eyePupil, { width: eyeSize * 0.6, height: eyeSize * 0.6 }]} />
            </View>
          </View>
          
          {/* Beak/Mouth */}
          <View style={styles.beak} />
          
          {/* Mood Indicator */}
          <Text style={[styles.moodEmoji, { fontSize: size === 'small' ? 12 : size === 'medium' ? 16 : 20 }]}>
            {getMoodEmoji()}
          </Text>
        </View>
        
        {/* Wings */}
        <View style={[styles.wing, styles.leftWing]} />
        <View style={[styles.wing, styles.rightWing]} />
        
        {/* Highlight */}
        <View style={styles.highlight} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotBody: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#46a302',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  eyesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  eye: {
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  eyePupil: {
    backgroundColor: '#333',
    borderRadius: 10,
  },
  beak: {
    width: 8,
    height: 6,
    backgroundColor: '#ff9500',
    borderRadius: 4,
    marginBottom: 2,
  },
  moodEmoji: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  wing: {
    position: 'absolute',
    width: 20,
    height: 30,
    backgroundColor: '#46a302',
    borderRadius: 15,
    top: '30%',
  },
  leftWing: {
    left: -8,
    transform: [{ rotate: '-20deg' }],
  },
  rightWing: {
    right: -8,
    transform: [{ rotate: '20deg' }],
  },
  highlight: {
    position: 'absolute',
    top: 8,
    left: 12,
    width: 16,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 8,
  },
});