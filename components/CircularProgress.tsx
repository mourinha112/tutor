import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#58cc02',
  backgroundColor = '#e5e5e5',
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />
      
      {/* Progress Circle */}
      <View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [
              { rotate: '-90deg' },
              { rotateY: progress > 50 ? '0deg' : '180deg' },
            ],
          },
        ]}
      />
      
      {progress > 50 && (
        <View
          style={[
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: color,
              borderRightColor: color,
              transform: [
                { rotate: `${(progress - 50) * 3.6 - 90}deg` },
              ],
            },
          ]}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

interface LessonProgressProps {
  progress: number;
  lesson: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export function LessonProgress({ 
  progress, 
  lesson, 
  isCompleted = false, 
  isLocked = false 
}: LessonProgressProps) {
  const getColor = () => {
    if (isLocked) return '#ce82ff';
    if (isCompleted) return '#58cc02';
    if (progress > 0) return '#1cb0f6';
    return '#e5e5e5';
  };

  const getIcon = () => {
    if (isLocked) return '🔒';
    if (isCompleted) return '👑';
    if (progress > 50) return '⭐';
    return '📚';
  };

  return (
    <View style={styles.lessonContainer}>
      <CircularProgress
        progress={isCompleted ? 100 : progress}
        size={80}
        strokeWidth={6}
        color={getColor()}
        backgroundColor="#f0f0f0"
      >
        <View style={styles.lessonContent}>
          <Text style={styles.lessonIcon}>{getIcon()}</Text>
          <Text style={[styles.lessonProgress, { color: getColor() }]}>
            {isCompleted ? '✓' : `${Math.round(progress)}%`}
          </Text>
        </View>
      </CircularProgress>
      <Text style={styles.lessonTitle}>{lesson}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  lessonContainer: {
    alignItems: 'center',
    margin: 8,
  },
  lessonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  lessonProgress: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  lessonTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b4b4b',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 80,
  },
});