import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface ReactLogoProps {
  size?: number;
  showText?: boolean;
  color?: string;
}

export default function ReactLogo({ 
  size = 100, 
  showText = false, 
  color = '#a30e0e' 
}: ReactLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image 
        source={require('@/assets/images/transparent-logo.png')}
        style={{ 
          width: size, 
          height: size,
          resizeMode: 'contain'
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
