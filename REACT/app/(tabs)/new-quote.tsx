import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useQuotes } from '@/hooks/useQuotes';

export default function CreateQuote() {
  const router = useRouter();
  const { createQuote } = useQuotes();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [quoteData, setQuoteData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    project_address: '',
    postal_code: '',
    project_name: '',
    photos: [] as any[],
    measurements: [] as Array<{ room: string; length: number; width: number }>,
    material_name: '',
    material_cost_per_sqft: 0,
    labor_cost_per_sqft: 2.5,
    additional_costs: [] as Array<{ name: string; amount: number }>,
    notes: '',
  });

  const steps = [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Photos' },
    { number: 3, label: 'Measurements' },
    { number: 4, label: 'Costs' },
    { number: 5, label: 'Summary' },
  ];

  const handleNext = (data: any) => {
    setQuoteData({ ...quoteData, ...data });
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSave = async () => {
    // Calculate totals
    const totalSquareFootage = quoteData.measurements.reduce((sum, m) => {
      return sum + (m.length * m.width);
    }, 0);

    const materialCost = totalSquareFootage * (quoteData.material_cost_per_sqft || 0);
    const laborCost = totalSquareFootage * (quoteData.labor_cost_per_sqft || 0);
    const additionalCostsTotal = quoteData.additional_costs.reduce((sum, cost) => sum + (cost.amount || 0), 0);
    const subtotal = materialCost + laborCost + additionalCostsTotal;
    const rebateAmount = quoteData.postal_code ? subtotal * 0.15 : 0; // 15% rebate mock
    const finalTotal = subtotal - rebateAmount;

    setSaving(true);
    try {
      const newQuote = await createQuote({
        client_name: quoteData.client_name,
        client_email: quoteData.client_email || undefined,
        client_phone: quoteData.client_phone || undefined,
        project_name: quoteData.project_name || quoteData.client_name,
        address: quoteData.project_address || undefined,
        square_footage: totalSquareFootage,
        material_cost: materialCost,
        labor_cost: laborCost,
        rebate_amount: rebateAmount,
        amount: finalTotal,
        status: 'draft',
        notes: quoteData.notes || undefined,
      });

      if (newQuote) {
        Alert.alert('Success', 'Quote created successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/quotes')
          }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create quote. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView edges={['top','bottom']} style={[{ backgroundColor: '#FFFFFF' }, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Quote</Text>
          <View style={{ width: 40 }} />
        </View>

        <ProgressStepper steps={steps} currentStep={currentStep} />
      </View>

      {/* Step Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && (
          <StepDetails data={quoteData} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <StepPhotos data={quoteData} onNext={handleNext} />
        )}
        {currentStep === 3 && (
          <StepMeasurements data={quoteData} onNext={handleNext} />
        )}
        {currentStep === 4 && (
          <StepCosts data={quoteData} onNext={handleNext} />
        )}
        {currentStep === 5 && (
          <StepSummary data={quoteData} onSave={handleSave} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressStepper({ steps, currentStep }: { steps: any[]; currentStep: number }) {
  return (
    <View style={styles.progressContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                step.number < currentStep && styles.stepCompleted,
                step.number === currentStep && styles.stepActive,
              ]}
            >
              {step.number < currentStep ? (
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    step.number === currentStep && styles.stepNumberActive,
                  ]}
                >
                  {step.number}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                step.number === currentStep && styles.stepLabelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.connector,
                step.number < currentStep && styles.connectorCompleted,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

function StepDetails({ data, onNext }: { data: any; onNext: (data: any) => void }) {
  const [formData, setFormData] = useState({
    client_name: data.client_name || '',
    client_phone: data.client_phone || '',
    project_address: data.project_address || '',
    postal_code: data.postal_code || '',
    project_name: data.project_name || '',
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = () => {
    const newErrors: any = {};
    if (!formData.client_name.trim()) newErrors.client_name = 'Required';
    if (!formData.postal_code.trim()) newErrors.postal_code = 'Required for rebate lookup';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext(formData);
  };

  const isValid = formData.client_name.trim() && formData.postal_code.trim();

  return (
    <View style={styles.stepContainer}>
      <View style={styles.section}>
        <Text style={styles.title}>Project Details</Text>
        <Text style={styles.subtitle}>Enter client information to get started</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Client Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.client_name && styles.inputError]}
            value={formData.client_name}
            onChangeText={(text) => handleChange('client_name', text)}
            placeholder="John Smith"
            placeholderTextColor="#9CA3AF"
          />
          {errors.client_name && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{errors.client_name}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Client Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.client_phone}
            onChangeText={(text) => handleChange('client_phone', text)}
            placeholder="(555) 123-4567"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Project Address</Text>
          <TextInput
            style={styles.input}
            value={formData.project_address}
            onChangeText={(text) => handleChange('project_address', text)}
            placeholder="123 Main Street"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Postal Code <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.postal_code && styles.inputError]}
            value={formData.postal_code}
            onChangeText={(text) => handleChange('postal_code', text)}
            placeholder="12345"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
          />
          {errors.postal_code ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{errors.postal_code}</Text>
            </View>
          ) : (
            <Text style={styles.hintText}>
              💡 We'll find local rebates based on this
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Project Name (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.project_name}
            onChangeText={(text) => handleChange('project_name', text)}
            placeholder="Attic Insulation"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isValid}
      >
        <Text style={styles.nextButtonText}>Next: Add Photos</Text>
      </TouchableOpacity>
    </View>
  );
}

function StepPhotos({ data, onNext }: { data: any; onNext: (data: any) => void }) {
  const [photos, setPhotos] = useState<string[]>(data.photos || []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to add photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChooseFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setPhotos([...photos, ...newPhotos]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photos. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    onNext({ photos });
  };

  return (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.title}>Upload Photos</Text>
        <Text style={styles.subtitle}>
          Take clear photos of the area to be insulated
        </Text>
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 Good photos help create accurate quotes!
          </Text>
        </View>
      </View>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Upload Buttons */}
      <View style={styles.uploadButtonsContainer}>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleTakePhoto}
        >
          <Ionicons name="camera" size={24} color="#7cd35c" />
          <Text style={styles.cameraButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handleChooseFromGallery}
        >
          <Ionicons name="images" size={24} color="#6B7280" />
          <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {photos.length > 0 && (
        <View style={styles.photoCounter}>
          <Text style={styles.photoCounterText}>
            {photos.length} photo{photos.length !== 1 ? 's' : ''} added
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.nextButton, photos.length === 0 && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={photos.length === 0}
      >
        <Text style={styles.nextButtonText}>Next: Add Measurements</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StepMeasurements({ data, onNext }: { data: any; onNext: (data: any) => void }) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.section}>
        <Text style={styles.title}>Measurements</Text>
        <Text style={styles.subtitle}>Measure the area(s) to be insulated</Text>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => onNext({ measurements: [] })}
      >
        <Text style={styles.nextButtonText}>Next: Add Costs</Text>
      </TouchableOpacity>
    </View>
  );
}

function StepCosts({ data, onNext }: { data: any; onNext: (data: any) => void }) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.section}>
        <Text style={styles.title}>Costs & Materials</Text>
        <Text style={styles.subtitle}>Select materials and calculate costs</Text>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => onNext({})}
      >
        <Text style={styles.nextButtonText}>Next: Review Quote</Text>
      </TouchableOpacity>
    </View>
  );
}

function StepSummary({ data, onSave }: { data: any; onSave: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);

  // Calculate totals
  const totalSquareFootage = data.measurements.reduce((sum: number, m: any) => {
    return sum + (m.length * m.width);
  }, 0);

  const materialCost = totalSquareFootage * (data.material_cost_per_sqft || 0);
  const laborCost = totalSquareFootage * (data.labor_cost_per_sqft || 0);
  const additionalCostsTotal = data.additional_costs.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);
  const subtotal = materialCost + laborCost + additionalCostsTotal;
  const rebateAmount = data.postal_code ? subtotal * 0.15 : 0; // 15% rebate mock
  const finalTotal = subtotal - rebateAmount;

  const handleSave = async () => {
    if (!data.client_name || !data.project_name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await onSave();
    } catch (error) {
      Alert.alert('Error', 'Failed to create quote. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.section}>
        <Text style={styles.title}>Quote Summary</Text>
        <Text style={styles.subtitle}>Review your quote details</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Client:</Text>
          <Text style={styles.summaryValue}>{data.client_name}</Text>
        </View>
        {data.project_address && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Address:</Text>
            <Text style={styles.summaryValue}>{data.project_address}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Area:</Text>
          <Text style={styles.summaryValue}>{totalSquareFootage.toFixed(2)} sqft</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Material Cost:</Text>
          <Text style={styles.summaryValue}>${materialCost.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Labor Cost:</Text>
          <Text style={styles.summaryValue}>${laborCost.toFixed(2)}</Text>
        </View>
        {rebateAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rebate:</Text>
            <Text style={[styles.summaryValue, { color: '#7cd35c' }]}>-${rebateAmount.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, saving && styles.nextButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.nextButtonText}>Save Quote</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: '#7cd35c',
  },
  stepActive: {
    backgroundColor: '#7cd35c',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  stepLabelActive: {
    fontWeight: 'bold',
    color: '#7cd35c',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  connectorCompleted: {
    backgroundColor: '#7cd35c',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 4,
  },
  hintText: {
    fontSize: 14,
    color: '#74C0FC',
    marginTop: 8,
  },
  tipBox: {
    backgroundColor: '#E8F4F8',
    borderWidth: 2,
    borderColor: '#74C0FC',
    borderRadius: 8,
    padding: 12,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7cd35c',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  photoContainer: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  uploadButtonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7cd35c',
    borderRadius: 8,
    height: 56,
    gap: 12,
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7cd35c',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    height: 56,
    gap: 12,
  },
  galleryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  photoCounter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoCounterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7cd35c',
  },
  nextButton: {
    backgroundColor: '#7cd35c',
    borderRadius: 8,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  nextButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
