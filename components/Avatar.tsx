import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Platform, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

interface AvatarProps {
  isSpeaking: boolean;
  videoUrl?: string;
  variant?: 'overlay' | 'inline';
  size?: number; // diameter in px for inline or to override
}

export function Avatar({ isSpeaking, videoUrl, variant = 'overlay', size }: AvatarProps) {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const wave1Anim = useRef(new Animated.Value(8)).current;
  const wave2Anim = useRef(new Animated.Value(16)).current;
  const wave3Anim = useRef(new Animated.Value(8)).current;
  
  const videoRef = useRef<Video>(null);

  const { width: screenWidth } = dimensions;
  const isDesktopView = screenWidth > 768;
  const isTabletView = screenWidth > 600 && screenWidth <= 768;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isSpeaking) {
      // Start video playback when speaking
      if (videoRef.current) {
        videoRef.current.playAsync();
      }

      // Subtle scale animation
      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.98,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Glow effect
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Pulse effect
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Sound waves animation
      const waveAnimation1 = Animated.loop(
        Animated.sequence([
          Animated.timing(wave1Anim, {
            toValue: 20,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(wave1Anim, {
            toValue: 8,
            duration: 300,
            useNativeDriver: false,
          }),
        ])
      );

      const waveAnimation2 = Animated.loop(
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(wave2Anim, {
            toValue: 25,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(wave2Anim, {
            toValue: 16,
            duration: 250,
            useNativeDriver: false,
          }),
        ])
      );

      const waveAnimation3 = Animated.loop(
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(wave3Anim, {
            toValue: 18,
            duration: 280,
            useNativeDriver: false,
          }),
          Animated.timing(wave3Anim, {
            toValue: 8,
            duration: 280,
            useNativeDriver: false,
          }),
        ])
      );

      scaleAnimation.start();
      glowAnimation.start();
      pulseAnimation.start();
      waveAnimation1.start();
      waveAnimation2.start();
      waveAnimation3.start();

      return () => {
        scaleAnimation.stop();
        glowAnimation.stop();
        pulseAnimation.stop();
        waveAnimation1.stop();
        waveAnimation2.stop();
        waveAnimation3.stop();
      };
    } else {
      // Stop video when not speaking
      if (videoRef.current) {
        videoRef.current.pauseAsync();
        videoRef.current.setPositionAsync(0);
      }

      // Return to normal state
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(wave1Anim, {
          toValue: 8,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(wave2Anim, {
          toValue: 16,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(wave3Anim, {
          toValue: 8,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isSpeaking, scaleAnim, opacityAnim, pulseAnim, wave1Anim, wave2Anim, wave3Anim]);

  const onVideoStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.didJustFinish && isSpeaking) {
      videoRef.current?.replayAsync();
    }
  };

  // Dynamic sizing
  const diameter = size ?? (isDesktopView ? 200 : isTabletView ? 180 : 160);
  const ring = diameter + 20;
  const dynamicRing = { width: ring, height: ring, borderRadius: ring / 2 } as const;
  const dynamicAvatar = { width: diameter, height: diameter, borderRadius: diameter / 2 } as const;
  const dynamicWebVideo = { borderRadius: diameter / 2 } as const;

  // On web, ensure the avatar container also clips and has borderRadius so shadows/box-shadows
  // are rendered as circular rather than rectangular (prevents the large square artifact).
  const dynamicWebContainer = Platform.OS === 'web' ? { borderRadius: diameter / 2, overflow: 'hidden' as const } : undefined;

  const containerStyle = variant === 'overlay'
    ? [styles.container, isDesktopView && styles.desktopContainer, isTabletView && styles.tabletContainer]
    : [styles.inlineContainer];

  const avatarContainerExtras = [
    variant === 'overlay' ? null : styles.noShadow,
    Platform.OS === 'web' && styles.webAvatarContainer,
  ];

  return (
    <View style={containerStyle}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          // Size follows avatar
          dynamicRing,
          {
            opacity: isSpeaking ? opacityAnim : 0.3,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={isSpeaking ? ['#6366f1', '#8b5cf6', '#ec4899'] : ['#e2e8f0', '#cbd5e1']}
          style={[
            styles.gradientRing,
            dynamicRing
          ]}
        />
      </Animated.View>

      {/* Avatar container */}
      <Animated.View
        style={[
          styles.avatarContainer,
          // Inline variant has no shadow and is centered by parent
          ...avatarContainerExtras,
          // Remove box-shadow rectangle on web — keep only circular mask
          Platform.OS === 'web' && styles.webAvatarContainer,
          dynamicWebContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Container circular para cortar o vídeo */}
        <View style={[
          styles.avatar,
          dynamicAvatar
        ]}>
          {/* Video Avatar com máscara circular */}
          {Platform.OS !== 'web' ? (
            <Video
              ref={videoRef}
              source={{ uri: videoUrl || 'https://clips-presenters.d-id.com/v2/Adam/36wCtvjdAi/C6evUUgPyQ/talkingPreview.mp4' }}
              style={[
                styles.avatarVideo
              ]}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping={true}
              isMuted={true}
              onPlaybackStatusUpdate={onVideoStatusUpdate}
            />
          ) : (
            <video
              style={{
                ...styles.webVideo,
                ...dynamicWebVideo,
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                display: 'block',
              }}
              src={videoUrl || 'https://clips-presenters.d-id.com/v2/Adam/36wCtvjdAi/C6evUUgPyQ/talkingPreview.mp4'}
              muted
              loop
              playsInline
              ref={(video) => {
                if (video) {
                  try {
                    if (isSpeaking) {
                      video.play();
                    } else {
                      video.pause();
                      video.currentTime = 0;
                    }
                  } catch (e) {
                    // ignore play/pause errors on browsers that block autoplay
                  }
                }
              }}
            />
          )}
        </View>
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Animated.View style={[styles.soundWave, { height: wave1Anim }]} />
            <Animated.View style={[styles.soundWave, { height: wave2Anim }]} />
            <Animated.View style={[styles.soundWave, { height: wave3Anim }]} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineContainer: {
    position: 'relative',
    top: 0,
    right: 0,
    zIndex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    zIndex: 1,
  },
  gradientRing: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
  },
  avatarContainer: {
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 2,
  },
  noShadow: {
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    shadowColor: 'transparent',
  },
  // Web override to prevent square shadow/box around the circular avatar
  webAvatarContainer: {
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    shadowColor: 'transparent',
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarVideo: {
    width: '120%',
    height: '120%',
    position: 'absolute',
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: -15,
    left: '50%',
    marginLeft: -18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  soundWave: {
    width: 4,
    backgroundColor: '#6366f1',
    borderRadius: 2,
    opacity: 0.8,
  },
  webVideo: {
    width: '120%',
    height: '120%',
    position: 'absolute',
    borderRadius: 80,
    objectFit: 'cover' as const,
  },
  // Responsive Styles
  desktopContainer: {
    top: 15,
    right: 25,
  },
  tabletContainer: {
    top: 12,
    right: 20,
  },
  desktopGlowRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  tabletGlowRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  desktopGradientRing: {
    borderRadius: 110,
  },
  tabletGradientRing: {
    borderRadius: 100,
  },
  desktopAvatarContainer: {
    shadowRadius: 16,
  },
  tabletAvatarContainer: {
    shadowRadius: 14,
  },
  desktopAvatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  tabletAvatar: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  desktopAvatarVideo: {
    width: '120%',
    height: '120%',
  },
  tabletAvatarVideo: {
    width: '120%',
    height: '120%',
  },
  desktopWebVideo: {
    width: '120%',
    height: '120%',
    borderRadius: 100,
  },
  tabletWebVideo: {
    width: '120%',
    height: '120%',
    borderRadius: 90,
  },
});