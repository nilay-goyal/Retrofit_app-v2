import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface LargeButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'success' | 'outline';
  size?: 'medium' | 'large' | 'huge';
  icon?: string;
  disabled?: boolean;
}

export default function LargeButton({ 
  children, 
  onPress, 
  variant = 'primary', 
  size = 'large', 
  icon, 
  disabled = false 
}: LargeButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.98);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1);
    }
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.6 : 1,
  }));

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { 
          backgroundColor: Colors.light.coral, // Now uses #a30e0e
          borderWidth: 0,
        };
      case 'success':
        return { 
          backgroundColor: Colors.light.sageGreen,
          borderWidth: 0,
        };
      case 'outline':
        return { 
          backgroundColor: '#FFFFFF',
          borderWidth: 2,
          borderColor: Colors.light.sunshine,
        };
      default:
        return { 
          backgroundColor: Colors.light.coral,
          borderWidth: 0,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'medium':
        return { 
          paddingVertical: 16, 
          paddingHorizontal: 24, 
          borderRadius: 12, 
          minHeight: 60,
          fontSize: 16,
        };
      case 'large':
        return { 
          paddingVertical: 24, 
          paddingHorizontal: 32, 
          borderRadius: 16, 
          minHeight: 80,
          fontSize: 18,
        };
      case 'huge':
        return { 
          paddingVertical: 32, 
          paddingHorizontal: 40, 
          borderRadius: 24, 
          minHeight: 100,
          fontSize: 20,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') {
      return Colors.light.coral; // Now uses #a30e0e
    }
    return '#FFFFFF';
  };

  return (
    <AnimatedTouchable
      style={[
        styles.button, 
        getVariantStyle(), 
        getSizeStyle(), 
        animatedStyle
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon && <Text style={[styles.icon, { fontSize: getSizeStyle().fontSize + 6 }]}>{icon}</Text>}
        <Text style={[
          styles.text, 
          { 
            color: getTextColor(),
            fontSize: getSizeStyle().fontSize,
          }
        ]}>
          {children}
        </Text>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});

