import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
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

export default function Dashboard() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleTakeTest = () => {
    router.push('/camera');
  };

  const handleViewHistory = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <BennyMascot 
            expression="happy" 
            size="large" 
            message="Ready for your next test?" 
            showMessage={true} 
          />
          
          <Text style={styles.title}>Your Kidney Health</Text>
          <Text style={styles.subtitle}>
            Stay on top of your health with regular testing
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Tests This Month</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>Good</Text>
              <Text style={styles.statLabel}>Last Result</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Days Since Last Test</Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <LargeButton 
              onPress={handleTakeTest} 
              variant="primary" 
              size="huge" 
              icon="📷"
            >
              Take New Test
            </LargeButton>
            
            <LargeButton 
              onPress={handleViewHistory} 
              variant="outline" 
              size="large" 
              icon="📊"
            >
              View History
            </LargeButton>
          </View>

          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Health Tips</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                Drink plenty of water throughout the day to keep your kidneys healthy.
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipText}>
                Regular testing helps catch any changes early.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.cream,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.gray[600],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.sunshine,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.coral,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.gray[600],
    textAlign: 'center',
    fontWeight: '500',
  },
  quickActions: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  tipsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.gentleBlue,
  },
  tipText: {
    fontSize: 16,
    color: Colors.light.gray[800],
    lineHeight: 22,
    textAlign: 'center',
  },
});
