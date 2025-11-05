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
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useQuotes } from '@/hooks/useQuotes';
import { useSettings } from '@/hooks/useSettings';

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
    items: [] as Array<{
      type: 'Room' | 'Labor' | 'Material' | 'Service' | 'Custom';
      name: string;
      length?: number;
      width?: number;
      quantity?: number;
      calculatedArea?: number;
      price?: number;
      priceOption?: string;
    }>,
    notes: '',
  });

  const steps = [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Photos' },
    { number: 3, label: 'Items' },
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
    // Calculate totals from items
    const totalCost = quoteData.items.reduce((sum, item) => {
      return sum + (item.price || 0);
    }, 0);

    const totalSquareFootage = quoteData.items
      .filter(item => item.type === 'Room')
      .reduce((sum, item) => sum + (item.calculatedArea || 0), 0);

    const rebateAmount = quoteData.postal_code ? totalCost * 0.15 : 0; // 15% rebate mock
    const finalTotal = totalCost - rebateAmount;

    setSaving(true);
    try {
      const newQuote = await createQuote({
        client_name: quoteData.client_name,
        client_email: quoteData.client_email || undefined,
        client_phone: quoteData.client_phone || undefined,
        project_name: quoteData.project_name || quoteData.client_name,
        address: quoteData.project_address || undefined,
        square_footage: totalSquareFootage,
        material_cost: 0, // Will be calculated from items
        labor_cost: 0, // Will be calculated from items
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
          <StepItems data={quoteData} onNext={handleNext} />
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
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
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
        <Text style={styles.nextButtonText}>Next: List Items</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StepItems({ data, onNext }: { data: any; onNext: (data: any) => void }) {
  const [items, setItems] = useState<Array<{
    type: 'Room' | 'Labor' | 'Material' | 'Service' | 'Custom';
    name: string;
    length?: number;
    width?: number;
    quantity?: number;
    calculatedArea?: number;
  }>>(data.items || []);

  const [errors, setErrors] = useState<Record<number, string>>({});
  const [expandedItemTypeDropdowns, setExpandedItemTypeDropdowns] = useState<Record<number, boolean>>({});

  // Initialize with one item if empty
  React.useEffect(() => {
    if (items.length === 0) {
      setItems([{
        type: 'Room',
        name: '',
      }]);
    }
  }, []);

  const addItem = () => {
    setItems([...items, {
      type: 'Room',
      name: '',
    }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    // Calculate area for Room type
    if (field === 'length' || field === 'width' || field === 'type') {
      if (updated[index].type === 'Room' && updated[index].length && updated[index].width) {
        updated[index].calculatedArea = updated[index].length * updated[index].width;
      } else if (updated[index].type !== 'Room') {
        updated[index].calculatedArea = undefined;
      }
    }
    
    setItems(updated);
    // Clear error for this field
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors: Record<number, string> = {};
    
    items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[index] = 'Name is required';
        return;
      }
      
      if (item.type === 'Room') {
        if (!item.length || item.length <= 0) {
          newErrors[index] = 'Length is required';
          return;
        }
        if (!item.width || item.width <= 0) {
          newErrors[index] = 'Width is required';
          return;
        }
      } else if (item.type === 'Labor' || item.type === 'Material') {
        if (!item.quantity || item.quantity <= 0) {
          newErrors[index] = 'Quantity is required';
          return;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fill in all required fields for each item.');
      return;
    }
    onNext({ items });
  };

  const renderItemFields = (item: any, index: number) => {
    const showLengthWidth = item.type === 'Room' || item.type === 'Custom';
    const showQuantity = item.type === 'Labor' || item.type === 'Material' || item.type === 'Custom';
    const showAll = item.type === 'Custom';

    return (
      <View key={index} style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemNumber}>Item {index + 1}</Text>
          {items.length > 1 && (
            <TouchableOpacity onPress={() => removeItem(index)}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Item Type</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setExpandedItemTypeDropdowns({
              ...expandedItemTypeDropdowns,
              [index]: !expandedItemTypeDropdowns[index]
            })}
          >
            <Text style={styles.dropdownText}>
              {item.type || 'Select type'}
            </Text>
            <Ionicons 
              name={expandedItemTypeDropdowns[index] ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
            />
          </TouchableOpacity>
          {expandedItemTypeDropdowns[index] && (
            <View style={styles.dropdownOptions}>
              {['Room', 'Labor', 'Material', 'Service', 'Custom'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.dropdownOption,
                    item.type === type && styles.dropdownOptionSelected
                  ]}
                  onPress={() => {
                    updateItem(index, 'type', type);
                    setExpandedItemTypeDropdowns({ ...expandedItemTypeDropdowns, [index]: false });
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors[index]?.includes('Name') && styles.inputError]}
            value={item.name}
            onChangeText={(text) => updateItem(index, 'name', text)}
            placeholder="e.g., Attic Insulation"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {(showLengthWidth || showAll) && (
          <View style={styles.dimensionsRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>
                Length (ft) {item.type === 'Room' && <Text style={styles.required}>*</Text>}
              </Text>
              <TextInput
                style={[styles.input, errors[index]?.includes('Length') && styles.inputError]}
                value={item.length?.toString() || ''}
                onChangeText={(text) => updateItem(index, 'length', parseFloat(text) || 0)}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>
                Width (ft) {item.type === 'Room' && <Text style={styles.required}>*</Text>}
              </Text>
              <TextInput
                style={[styles.input, errors[index]?.includes('Width') && styles.inputError]}
                value={item.width?.toString() || ''}
                onChangeText={(text) => updateItem(index, 'width', parseFloat(text) || 0)}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        )}

        {(showQuantity || showAll) && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Quantity {(item.type === 'Labor' || item.type === 'Material') && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
              style={[styles.input, errors[index]?.includes('Quantity') && styles.inputError]}
              value={item.quantity?.toString() || ''}
              onChangeText={(text) => updateItem(index, 'quantity', parseFloat(text) || 0)}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
            />
          </View>
        )}

        {item.type === 'Room' && item.calculatedArea && (
          <View style={styles.calculatedArea}>
            <Text style={styles.calculatedAreaText}>
              Total Area: {item.calculatedArea.toFixed(2)} ft²
            </Text>
          </View>
        )}

        {errors[index] && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{errors[index]}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.title}>List your billable items</Text>
        <Text style={styles.subtitle}>Add items for your quote</Text>
      </View>

      {items.map((item, index) => renderItemFields(item, index))}

      <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
        <Ionicons name="add-circle-outline" size={24} color="#7cd35c" />
        <Text style={styles.addItemText}>+ Add Another Item</Text>
      </TouchableOpacity>

      <View style={styles.itemsCounter}>
        <Text style={styles.itemsCounterText}>
          Total billable items: <Text style={styles.itemsCounterNumber}>{items.length}</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.nextButton, items.length === 0 && styles.nextButtonDisabled]}
        onPress={handleNext}
        disabled={items.length === 0}
      >
        <Text style={styles.nextButtonText}>Next: Add Costs</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StepCosts({ data, onNext }: { data: any; onNext: (data: any) => void }) {
  const { settings } = useSettings();
  
  // Initialize items from previous page - automatically include all items
  const [items, setItems] = useState(
    (data.items || []).map((item: any) => ({
      ...item,
      costPerUnit: item.costPerUnit || 0, // Cost per quantity/area
      price: item.price || 0, // Total calculated price
      priceOption: item.priceOption || '',
    }))
  );

  // Get price options from user's materials library (settings)
  // Default materials if none exist
  const defaultMaterials = [
    { id: '1', name: 'Fiberglass Batt', cost_per_sqft: 1.25 },
    { id: '2', name: 'Spray Foam', cost_per_sqft: 3.50 },
    { id: '3', name: 'Cellulose', cost_per_sqft: 0.85 },
  ];
  
  // This would come from settings in the future - for now use defaults
  const materials = defaultMaterials;
  
  const priceOptions = [
    ...materials.map(material => ({
      label: `${material.name} $${material.cost_per_sqft}/sqft`,
      value: material.cost_per_sqft,
      unit: 'sqft',
    })),
    { label: 'Installation rate $50/hour', value: 50, unit: 'hour' },
    { label: 'Custom...', value: 'custom' },
  ];

  const [selectedPriceIndex, setSelectedPriceIndex] = useState<Record<number, number>>({});
  const [customPrices, setCustomPrices] = useState<Record<number, number>>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<number, boolean>>({});
  const [expandedDropdowns, setExpandedDropdowns] = useState<Record<number, boolean>>({});
  const [showDirectInput, setShowDirectInput] = useState<Record<number, boolean>>({});

  const getItemDisplayName = (item: any) => {
    let suffix = '';
    if (item.type === 'Room' && item.calculatedArea) {
      suffix = ` (${item.calculatedArea.toFixed(2)} ft²)`;
    } else if (item.quantity) {
      const unit = item.type === 'Labor' ? 'hours' : 'units';
      suffix = ` (${item.quantity} ${unit})`;
    }
    return `${item.name}${suffix}`;
  };

  const updateItemPrice = (index: number, priceIndex: number) => {
    const option = priceOptions[priceIndex];
    const item = items[index];
    
    if (option.value === 'custom') {
      setShowCustomInput({ ...showCustomInput, [index]: true });
      setShowDirectInput({ ...showDirectInput, [index]: false });
      setSelectedPriceIndex({ ...selectedPriceIndex, [index]: priceIndex });
    } else {
      const costPerUnit = option.value;
      let calculatedPrice = 0;
      
      if (option.unit === 'sqft' && item.calculatedArea) {
        calculatedPrice = item.calculatedArea * costPerUnit;
      } else if (option.unit === 'hour' || option.unit === 'unit') {
        calculatedPrice = (item.quantity || 1) * costPerUnit;
      } else {
        calculatedPrice = costPerUnit;
      }
      
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        costPerUnit: costPerUnit,
        price: calculatedPrice,
        priceOption: option.label,
      };
      setItems(updated);
      setSelectedPriceIndex({ ...selectedPriceIndex, [index]: priceIndex });
      setShowCustomInput({ ...showCustomInput, [index]: false });
      setShowDirectInput({ ...showDirectInput, [index]: false });
    }
  };

  const updateCustomPrice = (index: number, customPrice: number) => {
    const item = items[index];
    let calculatedPrice = customPrice;
    
    // If it's a room, multiply by area; if it has quantity, multiply by quantity
    if (item.type === 'Room' && item.calculatedArea) {
      calculatedPrice = customPrice * item.calculatedArea;
    } else if (item.quantity) {
      calculatedPrice = customPrice * item.quantity;
    }
    
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      costPerUnit: customPrice,
      price: calculatedPrice,
      priceOption: `Custom: $${customPrice.toFixed(2)}/${item.type === 'Room' ? 'sqft' : 'unit'}`,
    };
    setItems(updated);
    setCustomPrices({ ...customPrices, [index]: customPrice });
    setShowDirectInput({ ...showDirectInput, [index]: false });
  };

  const updateDirectCost = (index: number, costPerUnit: number) => {
    const item = items[index];
    let calculatedPrice = costPerUnit;
    
    // If it's a room, multiply by area; if it has quantity, multiply by quantity
    if (item.type === 'Room' && item.calculatedArea) {
      calculatedPrice = costPerUnit * item.calculatedArea;
    } else if (item.quantity) {
      calculatedPrice = costPerUnit * item.quantity;
    } else {
      calculatedPrice = costPerUnit;
    }
    
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      costPerUnit: costPerUnit,
      price: calculatedPrice,
      priceOption: `Manual: $${costPerUnit.toFixed(2)}/${item.type === 'Room' ? 'sqft' : item.quantity ? 'unit' : 'item'}`,
    };
    setItems(updated);
  };

  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleNext = () => {
    // Validate all items have prices
    const itemsWithoutPrice = items.filter(item => !item.price || item.price <= 0);
    if (itemsWithoutPrice.length > 0) {
      Alert.alert('Missing Prices', 'Please assign a price to all items.');
      return;
    }
    onNext({ items });
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.title}>Assign your costs</Text>
        <Text style={styles.subtitle}>Assign prices to each item</Text>
      </View>

      <View style={styles.costItemsContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.costItemRow}>
            <View style={styles.costItemName}>
              <Text style={styles.costItemNameText}>{getItemDisplayName(item)}</Text>
            </View>
            
            <View style={styles.priceSelectorContainer}>
              {/* Direct Cost Input - Always visible */}
              <View style={styles.directCostInput}>
                <Text style={styles.directCostLabel}>
                  Cost per {item.type === 'Room' ? 'sqft' : item.quantity ? 'unit' : 'item'}:
                </Text>
                <TextInput
                  style={styles.directCostField}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={item.costPerUnit > 0 ? item.costPerUnit.toString() : ''}
                  onChangeText={(text) => {
                    const value = parseFloat(text) || 0;
                    updateDirectCost(index, value);
                  }}
                />
              </View>

              {/* Or use preset dropdown */}
              <View style={styles.orDivider}>
                <View style={styles.orDividerLine} />
                <Text style={styles.orDividerText}>OR</Text>
                <View style={styles.orDividerLine} />
              </View>

              <TouchableOpacity
                style={styles.priceDropdown}
                onPress={() => setExpandedDropdowns({
                  ...expandedDropdowns,
                  [index]: !expandedDropdowns[index]
                })}
              >
                <Text style={styles.priceDropdownText}>
                  {item.priceOption || 'Select from presets'}
                </Text>
                <Ionicons 
                  name={expandedDropdowns[index] ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
              
              {expandedDropdowns[index] && (
                <View style={styles.priceOptionsList}>
                  {priceOptions.map((option, optIndex) => (
                    <TouchableOpacity
                      key={optIndex}
                      style={[
                        styles.priceOption,
                        selectedPriceIndex[index] === optIndex && styles.priceOptionSelected
                      ]}
                      onPress={() => {
                        updateItemPrice(index, optIndex);
                        setExpandedDropdowns({ ...expandedDropdowns, [index]: false });
                      }}
                    >
                      <Text style={styles.priceOptionText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {showCustomInput[index] && (
                <View style={styles.customPriceInput}>
                  <TextInput
                    style={styles.customPriceField}
                    placeholder="Enter price per unit"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    value={customPrices[index]?.toString() || ''}
                    onChangeText={(text) => updateCustomPrice(index, parseFloat(text) || 0)}
                  />
                </View>
              )}
              
              {item.price > 0 && (
                <View style={styles.itemPriceDisplay}>
                  <Text style={styles.itemPriceLabel}>Total:</Text>
                  <Text style={styles.itemPriceText}>${item.price.toFixed(2)}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.totalDisplay}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
      >
        <Text style={styles.nextButtonText}>Next: Review Quote</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StepSummary({ data, onSave }: { data: any; onSave: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const { settings } = useSettings();

  // Calculate totals from items
  const totalCost = (data.items || []).reduce((sum: number, item: any) => {
    return sum + (item.price || 0);
  }, 0);

  const totalSquareFootage = (data.items || [])
    .filter((item: any) => item.type === 'Room')
    .reduce((sum: number, item: any) => sum + (item.calculatedArea || 0), 0);

  const rebateAmount = data.postal_code ? totalCost * 0.15 : 0; // 15% rebate mock
  const taxRate = 0.08; // 8% tax
  const taxAmount = (totalCost - rebateAmount) * taxRate;
  const shippingHandling = 0; // Can be added later
  const finalTotal = totalCost - rebateAmount + taxAmount + shippingHandling;

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

  const generateInvoiceHTML = () => {
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    const invoiceNumber = `#${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const companyName = settings.profile.company || 'Your Company Name';
    const companyAddress = 'Your Address'; // Address field can be added to settings later
    const companyPhone = settings.profile.phone || 'Your Phone';
    const companyEmail = settings.profile.email || 'Your Email';

    const itemsHTML = (data.items || []).map((item: any, index: number) => {
      // Get quantity and unit based on item type
      let qty = '1';
      let unit = '';
      
      if (item.type === 'Room' && item.calculatedArea) {
        qty = item.calculatedArea.toFixed(2);
        unit = 'sqft';
      } else if (item.quantity) {
        qty = item.quantity.toString();
        unit = item.type === 'Labor' ? 'hours' : 'units';
      }
      
      // Use costPerUnit if available, otherwise calculate from price
      const unitPrice = item.costPerUnit ? item.costPerUnit.toFixed(2) : 
        (item.type === 'Room' && item.calculatedArea 
          ? (item.price / (item.calculatedArea || 1)).toFixed(2)
          : (item.price / (item.quantity || 1)).toFixed(2));
      const total = item.price.toFixed(2);
      
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB;">${item.name || 'Item ' + (index + 1)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">${qty}</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">$ ${unitPrice}</td>
          <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">$ ${total}</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #2D3748; padding: 20px; }
            .header { background-color: #7cd35c; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
            .logo-placeholder { width: 60px; height: 60px; background-color: #9CA3AF; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; }
            .invoice-title { font-size: 32px; font-weight: bold; }
            .invoice-number { font-size: 16px; margin-top: 5px; }
            .date { text-align: right; margin: 15px 0; }
            .payment-terms { text-align: center; margin: 10px 0; color: #6B7280; font-size: 14px; }
            .info-section { display: flex; justify-content: space-between; margin: 20px 0; }
            .info-column { flex: 1; }
            .info-heading { color: #7cd35c; font-weight: bold; margin-bottom: 10px; font-size: 14px; }
            .info-text { margin: 5px 0; color: #2D3748; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #7cd35c; color: white; padding: 12px; text-align: left; font-weight: bold; }
            th:last-child, td:last-child { text-align: right; }
            th:nth-child(2), td:nth-child(2) { text-align: center; }
            td { padding: 12px; border-bottom: 1px solid #E5E7EB; }
            .summary { text-align: right; margin-top: 20px; }
            .summary-row { margin: 8px 0; display: flex; justify-content: flex-end; }
            .summary-label { width: 200px; text-align: right; padding-right: 20px; }
            .summary-value { width: 120px; text-align: right; }
            .total-row { background-color: #7cd35c; color: white; padding: 15px 0; font-weight: bold; font-size: 18px; margin-top: 10px; }
            .total-row .summary-label, .total-row .summary-value { color: white; }
            .remarks { margin: 30px 0; }
            .remarks-title { font-weight: bold; margin-bottom: 10px; }
            .payment-methods { margin: 20px 0; color: #6B7280; font-size: 14px; }
            .signature { text-align: center; margin: 40px 0; padding-top: 40px; border-top: 1px solid #E5E7EB; }
            .thank-you { text-align: center; font-weight: bold; font-style: italic; font-size: 18px; margin-top: 30px; color: #7cd35c; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-placeholder">LOGO</div>
            <div>
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${invoiceNumber}</div>
            </div>
          </div>
          
          <div class="date">
            <strong>DATE:</strong> ${date}
          </div>
          
          <div class="payment-terms">
            Payment terms (due on receipt, due in 30 days)
          </div>
          
          <div class="info-section">
            <div class="info-column">
              <div class="info-heading">COMPANY NAME</div>
              <div class="info-text">${companyName}</div>
              <div class="info-text">${companyAddress}</div>
              <div class="info-text">${companyPhone}</div>
              <div class="info-text">${companyEmail}</div>
            </div>
            <div class="info-column">
              <div class="info-heading">BILL TO</div>
              <div class="info-text">${data.client_name || 'Client Name'}</div>
              <div class="info-text">${data.project_name || 'Project Name'}</div>
              <div class="info-text">${data.project_address || 'Address'}</div>
              <div class="info-text">${data.client_phone || 'Phone'}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th>QTY</th>
                <th>UNIT PRICE</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-row">
              <div class="summary-label">SUBTOTAL:</div>
              <div class="summary-value">$ ${totalCost.toFixed(2)}</div>
            </div>
            ${rebateAmount > 0 ? `
            <div class="summary-row">
              <div class="summary-label">DISCOUNT:</div>
              <div class="summary-value">$ ${rebateAmount.toFixed(2)}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">SUBTOTAL LESS DISCOUNT:</div>
              <div class="summary-value">$ ${(totalCost - rebateAmount).toFixed(2)}</div>
            </div>
            ` : ''}
            <div class="summary-row">
              <div class="summary-label">TAX RATE:</div>
              <div class="summary-value">${(taxRate * 100).toFixed(0)}%</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">TOTAL TAX:</div>
              <div class="summary-value">$ ${taxAmount.toFixed(2)}</div>
            </div>
            ${shippingHandling > 0 ? `
            <div class="summary-row">
              <div class="summary-label">SHIPPING/HANDLING:</div>
              <div class="summary-value">$ ${shippingHandling.toFixed(2)}</div>
            </div>
            ` : ''}
            <div class="summary-row total-row">
              <div class="summary-label">INVOICE TOTAL</div>
              <div class="summary-value">$ ${finalTotal.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="remarks">
            <div class="remarks-title">Remarks / Payment Instructions:</div>
            <div style="margin-top: 10px; min-height: 50px;">${data.notes || ''}</div>
          </div>
          
          <div class="payment-methods">
            Make all checks payable to ${companyName}. Or submit payment via Venmo: <venmo account> or PayPal: <paypal account>
          </div>
          
          <div class="signature">
            Client Signature X
          </div>
          
          <div class="thank-you">
            Thank you for your business!
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = async () => {
    try {
      setGeneratingPdf(true);
      const html = generateInvoiceHTML();
      
      const { uri } = await Print.printToFileAsync({ html });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
        Alert.alert('Success', 'PDF generated and ready to share!');
      } else {
        Alert.alert('Success', `PDF saved to: ${uri}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleShareQuote = async () => {
    try {
      const shareMessage = `Quote for ${data.client_name || 'Client'}\n` +
        `Project: ${data.project_name || 'Project'}\n` +
        `Total: $${finalTotal.toFixed(2)}\n\n` +
        `View full quote details in the Retrofit app.`;

      if (await Sharing.isAvailableAsync()) {
        // For sharing text, we can use the native share sheet
        // Since Sharing.shareAsync requires a file URI, we'll generate a simple text file
        const html = `<html><body><p>${shareMessage.replace(/\n/g, '<br>')}</p></body></html>`;
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (error: any) {
      if (error.message && !error.message.includes('User did not share')) {
        Alert.alert('Error', 'Failed to share quote. Please try again.');
      }
    }
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.title}>Quote Summary</Text>
        <Text style={styles.subtitle}>Review your quote details</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderText}>Client Information</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Client:</Text>
          <Text style={styles.summaryValue}>{data.client_name}</Text>
        </View>
        {data.project_name && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Project:</Text>
            <Text style={styles.summaryValue}>{data.project_name}</Text>
          </View>
        )}
        {data.project_address && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Address:</Text>
            <Text style={styles.summaryValue}>{data.project_address}</Text>
          </View>
        )}
        {data.postal_code && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Postal Code:</Text>
            <Text style={styles.summaryValue}>{data.postal_code}</Text>
          </View>
        )}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderText}>Project Details</Text>
        </View>
        {totalSquareFootage > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Area:</Text>
            <Text style={styles.summaryValue}>{totalSquareFootage.toFixed(2)} sqft</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items:</Text>
          <Text style={styles.summaryValue}>{(data.items || []).length}</Text>
        </View>
        {(data.items || []).map((item: any, index: number) => (
          <View key={index} style={styles.itemSummaryRow}>
            <Text style={styles.itemSummaryText}>
              • {item.name} - ${item.price.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryHeaderText}>Cost Breakdown</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>${totalCost.toFixed(2)}</Text>
        </View>
        {rebateAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rebate:</Text>
            <Text style={[styles.summaryValue, { color: '#7cd35c' }]}>-${rebateAmount.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (8%):</Text>
          <Text style={styles.summaryValue}>${taxAmount.toFixed(2)}</Text>
        </View>
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

      <TouchableOpacity
        style={[styles.secondaryButton, generatingPdf && styles.secondaryButtonDisabled]}
        onPress={handleDownloadPDF}
        disabled={generatingPdf}
      >
        {generatingPdf ? (
          <ActivityIndicator color="#7cd35c" />
        ) : (
          <>
            <Ionicons name="download-outline" size={20} color="#7cd35c" />
            <Text style={styles.secondaryButtonText}>Download as PDF</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleShareQuote}
      >
        <Ionicons name="share-outline" size={20} color="#7cd35c" />
        <Text style={styles.secondaryButtonText}>Share Quote</Text>
      </TouchableOpacity>
    </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dropdownOptions: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#2D3748',
  },
  dropdownOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  priceOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  dimensionsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  calculatedArea: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  calculatedAreaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7cd35c',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7cd35c',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 56,
    marginBottom: 16,
    gap: 8,
  },
  addItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7cd35c',
  },
  itemsCounter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  itemsCounterText: {
    fontSize: 16,
    color: '#6B7280',
  },
  itemsCounterNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7cd35c',
  },
  costItemsContainer: {
    marginBottom: 24,
  },
  costItemRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  costItemName: {
    marginBottom: 12,
  },
  costItemNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  priceSelectorContainer: {
    marginTop: 8,
  },
  directCostInput: {
    marginBottom: 12,
  },
  directCostLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  directCostField: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orDividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  priceDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  priceDropdownText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  priceOptionsList: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  priceOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  priceOptionText: {
    fontSize: 16,
    color: '#2D3748',
  },
  customPriceInput: {
    marginTop: 12,
  },
  customPriceField: {
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  itemPriceDisplay: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  itemPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  itemPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7cd35c',
  },
  totalDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7cd35c',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    marginBottom: 16,
  },
  summaryHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
    textAlign: 'right',
  },
  itemSummaryRow: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  itemSummaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7cd35c',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#7cd35c',
    borderRadius: 8,
    height: 56,
    marginTop: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonDisabled: {
    opacity: 0.6,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7cd35c',
  },
});
