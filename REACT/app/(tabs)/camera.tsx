import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import LargeButton from '@/components/large-button';
import { Colors } from '@/constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CameraTab() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { damping: 15 });

    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleCameraCapture = async () => {
    if (cameraRef.current && hasPermission) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({ 
          quality: 0.8,
          base64: false 
        });
        
        // Navigate to processing screen with image
        router.push({
          pathname: '/processing',
          params: { imageUrl: photo.uri }
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        router.push({
          pathname: '/processing',
          params: { imageUrl: result.assets[0].uri }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  const toggleFlash = () => {
    setFlashMode(!flashMode);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <BennyMascot 
            expression="thinking" 
            size="large" 
            message="We need camera access to take your test photos!" 
            showMessage={true} 
          />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            Please enable camera access in your device settings to take test strip photos.
          </Text>
          <LargeButton 
            onPress={() => router.back()} 
            variant="primary" 
            size="large"
          >
            Go Back
          </LargeButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          ref={cameraRef}
          flash={flashMode ? 'on' : 'off'}
        >
          <Animated.View style={[styles.overlay, animatedStyle]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Take Test Photo</Text>
              <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
                <Text style={styles.flashButtonText}>{flashMode ? '⚡' : '⚡'}</Text>
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Line up your test strip inside the frame and tap the button to capture
              </Text>
            </View>

            {/* Camera Frame Overlay */}
            <View style={styles.frameContainer}>
              <View style={styles.cameraFrame}>
                <View style={styles.frameCorners}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
              </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity 
                onPress={handlePickFromGallery} 
                style={styles.galleryButton}
              >
                <Text style={styles.galleryButtonText}>📁</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCameraCapture}
                disabled={isProcessing}
                style={[
                  styles.captureButton,
                  isProcessing && styles.captureButtonDisabled
                ]}
              >
                <View style={styles.captureButtonInner}>
                  <Text style={styles.captureButtonText}>
                    {isProcessing ? '⏳' : '📷'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.placeholder} />
            </View>
          </Animated.View>
        </CameraView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flashButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  flashButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    lineHeight: 28,
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  cameraFrame: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.3,
    position: 'relative',
  },
  frameCorners: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.light.coral,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  galleryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonText: {
    fontSize: 24,
  },
  captureButton: {
    backgroundColor: Colors.light.coral,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonDisabled: {
    backgroundColor: Colors.light.gray[600],
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    fontSize: 24,
  },
  placeholder: {
    width: 60,
    height: 60,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: Colors.light.cream,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.gray[800],
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.light.gray[600],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});
