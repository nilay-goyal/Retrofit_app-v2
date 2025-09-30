import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import BennyMascot from '@/components/benny-mascot';
import LargeButton from '@/components/large-button';
import { Colors } from '@/constants/theme';

export default function Welcome() {
  const [isLoading, setIsLoading] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleGetStarted = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      router.push('/setup');
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Animated.View style={[styles.content, animatedStyle]}>
        <BennyMascot 
          expression="waving" 
          size="huge" 
          message="Hi there! I'm Benny!" 
          showMessage={true} 
        />
        
        <Text style={styles.title}>
          Welcome to <Text style={styles.brandName}>REACT</Text>!
        </Text>
        
        <Text style={styles.subtitle}>
          Your kidney health made simple and friendly
        </Text>
        
        <View style={styles.buttonContainer}>
          <LargeButton 
            onPress={handleGetStarted} 
            variant="primary" 
            size="huge" 
            icon="🌟"
            disabled={isLoading}
          >
            {isLoading ? 'Getting Started...' : "I'm New Here"}
          </LargeButton>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.cream,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 32,
  },
  brandName: {
    color: Colors.light.coral,
  },
  subtitle: {
    fontSize: 20,
    color: Colors.light.gray[600],
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 28,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
});

