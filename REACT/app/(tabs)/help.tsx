import React from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
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

export default function Help() {
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

  const handleContactSupport = () => {
    const phoneNumber = '1-800-KIDNEY-1';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      console.log('Phone dialer not available');
    });
  };

  const handleEmailSupport = () => {
    const email = 'support@reactkidneyhealth.com';
    Linking.openURL(`mailto:${email}`).catch(() => {
      console.log('Email client not available');
    });
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Contact',
      'For medical emergencies, please call 911 immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 911', style: 'default', onPress: () => Linking.openURL('tel:911') }
      ]
    );
  };

  const helpSections = [
    {
      title: '📷 Taking a Test',
      content: [
        '• Place your test strip on a flat, well-lit surface',
        '• Use the camera frame to align your test strip',
        '• Make sure the test strip is fully visible in the frame',
        '• Tap the capture button when ready',
        '• Wait for the processing to complete'
      ]
    },
    {
      title: '📊 Understanding Results',
      content: [
        '• Green (✅) means everything looks good',
        '• Yellow (⚠️) means keep monitoring',
        '• Red (📞) means contact your doctor',
        '• Results are based on color analysis of test strips',
        '• Always consult a healthcare professional for medical decisions'
      ]
    },
    {
      title: '🔄 Regular Testing',
      content: [
        '• Test every 2-3 weeks for best monitoring',
        '• Test at the same time of day for consistency',
        '• Use first-morning urine when possible',
        '• Keep your test strips stored properly',
        '• Check expiration dates on test strips'
      ]
    },
    {
      title: '💡 Health Tips',
      content: [
        '• Drink plenty of water throughout the day',
        '• Maintain a balanced diet with limited salt',
        '• Exercise regularly as recommended by your doctor',
        '• Avoid smoking and limit alcohol consumption',
        '• Manage diabetes and blood pressure if applicable'
      ]
    }
  ];

  const faqItems = [
    {
      question: 'How accurate are the results?',
      answer: 'Our AI analysis provides good guidance, but results should always be confirmed by a healthcare professional.'
    },
    {
      question: 'Can I share results with my doctor?',
      answer: 'Yes! Use the "Share with Doctor" button to send your results via email or messaging apps.'
    },
    {
      question: 'How often should I test?',
      answer: 'We recommend testing every 2-3 weeks, or as advised by your healthcare provider.'
    },
    {
      question: 'What if my results show concern?',
      answer: 'Don\'t panic! Contact your healthcare provider to discuss the results and next steps.'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <BennyMascot 
            expression="encouraging" 
            size="large" 
            message="I'm here to help!" 
            showMessage={true} 
          />
          
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            Everything you need to know about using REACT
          </Text>

          <View style={styles.sectionsContainer}>
            {helpSections.map((section, index) => (
              <View key={index} style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.content.map((item, itemIndex) => (
                  <Text key={itemIndex} style={styles.sectionItem}>
                    {item}
                  </Text>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.faqContainer}>
            <Text style={styles.faqTitle}>❓ Frequently Asked Questions</Text>
            {faqItems.map((item, index) => (
              <View key={index} style={styles.faqCard}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>

          <View style={styles.contactContainer}>
            <Text style={styles.contactTitle}>📞 Contact Support</Text>
            
            <LargeButton 
              onPress={handleContactSupport} 
              variant="primary" 
              size="large" 
              icon="📞"
            >
              Call Support: 1-800-KIDNEY-1
            </LargeButton>
            
            <LargeButton 
              onPress={handleEmailSupport} 
              variant="outline" 
              size="large" 
              icon="📧"
            >
              Email Support
            </LargeButton>

            <TouchableOpacity 
              onPress={handleEmergencyCall}
              style={styles.emergencyButton}
            >
              <Text style={styles.emergencyButtonText}>
                🚨 For Medical Emergencies: Call 911
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerTitle}>⚖️ Important Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              REACT is designed to help you monitor your kidney health, but it is not a replacement 
              for professional medical advice. Always consult with your healthcare provider about 
              any concerns or decisions regarding your health.
            </Text>
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
    paddingBottom: 40,
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
    fontSize: 16,
    color: Colors.light.gray[600],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  sectionsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.light.sunshine,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    marginBottom: 12,
  },
  sectionItem: {
    fontSize: 16,
    color: Colors.light.gray[600],
    lineHeight: 24,
    marginBottom: 4,
  },
  faqContainer: {
    width: '100%',
    marginBottom: 32,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.gentleBlue,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.coral,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 15,
    color: Colors.light.gray[600],
    lineHeight: 22,
  },
  contactContainer: {
    width: '100%',
    marginBottom: 32,
    gap: 16,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  emergencyButton: {
    backgroundColor: Colors.light.coral,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disclaimerContainer: {
    backgroundColor: Colors.light.gray[50],
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.light.gray[100],
    width: '100%',
    marginBottom: 32,
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    marginBottom: 12,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 14,
    color: Colors.light.gray[600],
    lineHeight: 20,
    textAlign: 'center',
  },
});

