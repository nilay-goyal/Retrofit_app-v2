import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StyleSheet, 
  Alert,
  Platform 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import BennyMascot from '@/components/benny-mascot';
import LargeButton from '@/components/large-button';
import { Colors } from '@/constants/theme';

export default function Setup() {
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: new Date(1950, 0, 1), // Default to 1950 for seniors
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date_of_birth: selectedDate }));
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleContinue = () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }

    const age = calculateAge(formData.date_of_birth);
    if (age < 18) {
      Alert.alert('Age Requirement', 'This app is designed for adults 18 and older.');
      return;
    }

    setIsLoading(true);
    // Simulate saving user data
    setTimeout(() => {
      // Here you would typically save to AsyncStorage or your backend
      router.push('/(tabs)');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Animated.View style={[styles.content, animatedStyle]}>
        <BennyMascot 
          expression="thinking" 
          size="large" 
          message="Let's get to know you!" 
          showMessage={true} 
        />
        
        <Text style={styles.title}>Tell Us About Yourself</Text>
        <Text style={styles.subtitle}>
          This helps us personalize your kidney health experience
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.textInput, { fontSize: 20 }]}
              value={formData.full_name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.light.gray[600]}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.date_of_birth.toLocaleDateString()}
              </Text>
              <Text style={styles.dateIcon}>📅</Text>
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={formData.date_of_birth}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )}
          </View>

          <View style={styles.ageDisplay}>
            <Text style={styles.ageText}>
              Age: {calculateAge(formData.date_of_birth)} years old
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <LargeButton 
            onPress={handleContinue} 
            variant="primary" 
            size="huge" 
            icon="✨"
            disabled={isLoading}
          >
            {isLoading ? 'Setting Up...' : 'Continue'}
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
  formContainer: {
    width: '100%',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.gray[800],
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: Colors.light.sunshine,
    fontSize: 20,
    color: Colors.light.gray[800],
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: Colors.light.sunshine,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    color: Colors.light.gray[800],
  },
  dateIcon: {
    fontSize: 20,
  },
  ageDisplay: {
    backgroundColor: Colors.light.gentleBlue,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  ageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
