import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

interface BennyMascotProps {
  expression?: 'happy' | 'encouraging' | 'thinking' | 'celebrating' | 'waving';
  message?: string;
  size?: 'small' | 'large' | 'huge';
  showMessage?: boolean;
}

export default function BennyMascot({ 
  expression = 'happy', 
  message = '', 
  size = 'large', 
  showMessage = true 
}: BennyMascotProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const bounce = useSharedValue(0);

  React.useEffect(() => {
    if (expression === 'celebrating') {
      scale.value = withRepeat(withSpring(1.1), 2, true);
    } else if (expression === 'waving') {
      rotate.value = withRepeat(withTiming(15, { duration: 500 }), -1, true);
    } else if (expression === 'encouraging') {
      bounce.value = withRepeat(withSpring(5, { damping: 8 }), -1, true);
    }
  }, [expression]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value }, 
      { rotate: `${rotate.value}deg` },
      { translateY: bounce.value }
    ],
  }));

  const expressions = {
    happy: '😊',
    encouraging: 'kidney', // Will use kidney logo instead of thumbs up
    thinking: '🤔',
    celebrating: '🎉',
    waving: '👋'
  };

  const sizes = {
    small: { container: 64, fontSize: 32 },
    large: { container: 96, fontSize: 48 },
    huge: { container: 128, fontSize: 64 }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle]}>
        <View style={[
          styles.mascotContainer, 
          { 
            width: sizes[size].container, 
            height: sizes[size].container 
          }
        ]}>
          <View style={styles.kidneyBean}>
            <Image 
              source={require('@/assets/images/transparent-logo.png')}
              style={{
                width: sizes[size].container * 0.7, // Much bigger - fills most of circle
                height: sizes[size].container * 0.7,
                resizeMode: 'contain'
              }}
            />
          </View>
          <View style={styles.stethoscope} />
        </View>
      </Animated.View>
      {showMessage && message && (
        <View style={styles.messageContainer}>
          <View style={styles.speechBubble}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  mascotContainer: {
    borderRadius: 50,
    backgroundColor: Colors.light.coral,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 16,
  },
  kidneyBean: {
    width: '80%',
    height: '80%',
    borderRadius: 40,
    backgroundColor: '#f38282', // Updated to soft red
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  face: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  stethoscope: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.gentleBlue,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messageContainer: {
    marginTop: 8,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.light.sunshine,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: Colors.light.gray[800],
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
});

