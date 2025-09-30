import React from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import BennyMascot from '@/components/benny-mascot';
import { Colors } from '@/constants/theme';

// Mock data for demonstration
const mockResults = [
  {
    id: '1',
    test_date: new Date('2024-01-15'),
    overall_status: 'great',
    protein_level: 'Normal',
    blood_level: 'Normal',
    glucose_level: 'Normal',
    notes: 'All levels looking good!'
  },
  {
    id: '2',
    test_date: new Date('2024-01-10'),
    overall_status: 'keep_watching',
    protein_level: 'Trace',
    blood_level: 'Normal',
    glucose_level: 'Normal',
    notes: 'Minor protein detected, continue monitoring'
  },
  {
    id: '3',
    test_date: new Date('2024-01-05'),
    overall_status: 'great',
    protein_level: 'Normal',
    blood_level: 'Normal',
    glucose_level: 'Normal',
    notes: 'Perfect results!'
  },
  {
    id: '4',
    test_date: new Date('2023-12-28'),
    overall_status: 'call_doctor',
    protein_level: 'High',
    blood_level: 'Normal',
    glucose_level: 'Normal',
    notes: 'Please consult your doctor about protein levels'
  },
];

export default function History() {
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

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'great': return '✅';
      case 'keep_watching': return '⚠️';
      case 'call_doctor': return '📞';
      default: return '❓';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'great': return 'Looking Great';
      case 'keep_watching': return 'Keep Watching';
      case 'call_doctor': return 'Call Doctor';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'great': return Colors.light.sageGreen;
      case 'keep_watching': return Colors.light.sunshine;
      case 'call_doctor': return Colors.light.coral; // Now uses #a30e0e
      default: return Colors.light.gray[600];
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const viewResult = (id: string) => {
    // Navigate to detailed results view
    router.push({
      pathname: '/results',
      params: { resultId: id }
    });
  };

  const renderResultItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View style={[
      animatedStyle,
      { marginBottom: index === mockResults.length - 1 ? 20 : 0 }
    ]}>
      <TouchableOpacity 
        onPress={() => viewResult(item.id)}
        style={styles.resultCard}
      >
        <View style={styles.resultHeader}>
          <Text style={styles.resultEmoji}>{getStatusEmoji(item.overall_status)}</Text>
          <View style={styles.resultInfo}>
            <Text style={styles.resultDate}>{formatDate(item.test_date)}</Text>
            <Text style={[
              styles.resultStatus,
              { color: getStatusColor(item.overall_status) }
            ]}>
              {getStatusMessage(item.overall_status)}
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </View>
        
        <View style={styles.resultDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Protein:</Text>
            <Text style={styles.detailValue}>{item.protein_level}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Blood:</Text>
            <Text style={styles.detailValue}>{item.blood_level}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Glucose:</Text>
            <Text style={styles.detailValue}>{item.glucose_level}</Text>
          </View>
        </View>

        {item.notes && (
          <Text style={styles.resultNotes}>{item.notes}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Animated.View style={[styles.header, animatedStyle]}>
        <BennyMascot 
          expression="thinking" 
          size="small" 
          message="Here's your test history!" 
          showMessage={true} 
        />
        <Text style={styles.title}>Test History</Text>
        <Text style={styles.subtitle}>
          Track your kidney health over time
        </Text>
      </Animated.View>

      <FlatList
        data={mockResults}
        renderItem={renderResultItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.cream,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gray[600],
    textAlign: 'center',
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  list: {
    flex: 1,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    marginBottom: 4,
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  arrowContainer: {
    padding: 8,
  },
  arrow: {
    fontSize: 20,
    color: Colors.light.gray[600],
    fontWeight: 'bold',
  },
  resultDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.light.gray[600],
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: Colors.light.gray[800],
    fontWeight: '600',
  },
  resultNotes: {
    fontSize: 14,
    color: Colors.light.gray[600],
    fontStyle: 'italic',
    backgroundColor: Colors.light.gray[50],
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.gentleBlue,
  },
});