/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Kidney Health App Brand Colors
const coral = '#a30e0e';      // Primary brand color (updated to medical red)
const sunshine = '#FFD93D';   // Accent color (unchanged)
const cream = '#FFF8E7';      // Background (unchanged)
const gentleBlue = '#74C0FC'; // Secondary (unchanged)
const sageGreen = '#51CF66';  // Success (unchanged)
const tintColorLight = coral;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: cream,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Kidney Health App Colors
    coral,
    sunshine,
    cream,
    gentleBlue,
    sageGreen,
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6', 
      600: '#6B7280',
      800: '#374151'
    }
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Kidney Health App Colors (adjusted for dark mode)
    coral,
    sunshine,
    cream: '#2D1B00',
    gentleBlue,
    sageGreen,
    gray: {
      50: '#1F2937',
      100: '#374151', 
      600: '#9CA3AF',
      800: '#F9FAFB'
    }
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
