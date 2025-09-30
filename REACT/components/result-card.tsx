import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

interface ResultCardProps {
  title: string;
  level?: string;
  status: 'great' | 'keep_watching' | 'call_doctor';
  description?: string;
  index?: number;
}

export default function ResultCard({ 
  title, 
  level, 
  status, 
  description, 
  index = 0 
}: ResultCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  React.useEffect(() => {
    const delay = index * 200;
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withSpring(0, { damping: 15 });
    }, delay);

    return () => clearTimeout(timer);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const statusConfig = {
    great: { 
      backgroundColor: '#F0FDF4', 
      borderColor: Colors.light.sageGreen, 
      textColor: '#15803D', 
      emoji: '✅', 
      message: 'Looking great!' 
    },
    keep_watching: { 
      backgroundColor: '#FEFCE8', 
      borderColor: Colors.light.sunshine, 
      textColor: '#A16207', 
      emoji: '⚠️', 
      message: 'Keep watching' 
    },
    call_doctor: { 
      backgroundColor: '#FFF7ED', 
      borderColor: '#FB923C', 
      textColor: '#C2410C', 
      emoji: '📞', 
      message: 'Call your doctor' 
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.great;

  return (
    <Animated.View style={animatedStyle}>
      <View style={[
        styles.container, 
        { 
          backgroundColor: currentStatus.backgroundColor, 
          borderColor: currentStatus.borderColor 
        }
      ]}>
        <Text style={styles.emoji}>{currentStatus.emoji}</Text>
        <Text style={styles.title}>{title}</Text>
        {level && <Text style={styles.level}>{level}</Text>}
        <Text style={[
          styles.status, 
          { color: currentStatus.textColor }
        ]}>
          {currentStatus.message}
        </Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  level: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
});

