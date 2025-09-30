import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import BennyMascot from '@/components/benny-mascot';
import { Colors } from '@/constants/theme';

export default function Processing() {
  const { imageUrl } = useLocalSearchParams<{ imageUrl: string }>();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const steps = [
    { text: 'Analyzing image quality...', duration: 2000 },
    { text: 'Detecting test strip boundaries...', duration: 2500 },
    { text: 'Reading protein levels...', duration: 2000 },
    { text: 'Reading blood levels...', duration: 2000 },
    { text: 'Reading glucose levels...', duration: 2000 },
    { text: 'Generating results...', duration: 1500 },
  ];

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { damping: 15 });

    // Start processing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 3000 }),
      -1,
      false
    );

    // Simulate processing steps
    let totalDuration = 0;
    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        setProgress(((index + 1) / steps.length) * 100);
      }, totalDuration);
      totalDuration += step.duration;
    });

    // Navigate to results after processing
    setTimeout(() => {
      router.replace({
        pathname: '/results',
        params: { 
          imageUrl,
          resultId: 'new_' + Date.now()
        }
      });
    }, totalDuration + 500);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress}%`,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Animated.View style={[styles.content, animatedStyle]}>
        <Animated.View style={mascotAnimatedStyle}>
          <BennyMascot 
            expression="thinking" 
            size="huge" 
            message="Working on your results!" 
            showMessage={true} 
          />
        </Animated.View>
        
        <Text style={styles.title}>Processing Your Test</Text>
        <Text style={styles.subtitle}>
          Please wait while we analyze your test strip
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[styles.progressFill, progressAnimatedStyle]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.currentStep}>
            {steps[currentStep]?.text || 'Almost done...'}
          </Text>
          
          <View style={styles.stepsList}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <Text style={[
                  styles.stepIcon,
                  index <= currentStep && styles.stepIconCompleted
                ]}>
                  {index < currentStep ? '✓' : index === currentStep ? '⏳' : '○'}
                </Text>
                <Text style={[
                  styles.stepText,
                  index <= currentStep && styles.stepTextCompleted
                ]}>
                  {step.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Did you know?</Text>
          <Text style={styles.tipsText}>
            Our AI analyzes multiple aspects of your test strip to provide accurate results, 
            including color intensity, line clarity, and proper positioning.
          </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 32,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.gray[600],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: Colors.light.gray[100],
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.coral,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.gray[800],
  },
  stepContainer: {
    width: '100%',
    marginBottom: 32,
  },
  currentStep: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.coral,
    textAlign: 'center',
    marginBottom: 20,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.gray[100],
  },
  stepIcon: {
    fontSize: 20,
    marginRight: 12,
    color: Colors.light.gray[600],
  },
  stepIconCompleted: {
    color: Colors.light.sageGreen,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.gray[600],
  },
  stepTextCompleted: {
    color: Colors.light.gray[800],
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.light.gentleBlue,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  tipsText: {
    fontSize: 16,
    color: Colors.light.gray[600],
    lineHeight: 22,
    textAlign: 'center',
  },
});

