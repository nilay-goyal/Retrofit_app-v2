import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, Filter, FeDropShadow } from 'react-native-svg';
import { Colors } from '@/constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ChallengeCardProps {
  title: string;
  description: string;
  icon: string;
  index: number;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ title, description, icon, index }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const beamOpacity = useSharedValue(0);
  const scaleY = useSharedValue(0.5);

  useEffect(() => {
    // Staggered animation for cards
    const delay = index * 200;
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withTiming(0, { duration: 600 });
    }, delay);

    // Beam pulse animation
    beamOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 })
      ),
      -1,
      true
    );

    scaleY.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const leftBeamStyle = useAnimatedStyle(() => ({
    opacity: beamOpacity.value,
    transform: [{ scaleY: scaleY.value }],
  }));

  const rightBeamStyle = useAnimatedStyle(() => ({
    opacity: beamOpacity.value,
    transform: [{ scaleY: scaleY.value }],
  }));

  return (
    <Animated.View style={[styles.challengeCard, cardAnimatedStyle]}>
      {/* Challenge Beams */}
      <Animated.View style={[styles.challengeBeam, styles.beamLeft, leftBeamStyle]} />
      <Animated.View style={[styles.challengeBeam, styles.beamRight, rightBeamStyle]} />

      {/* Challenge Visual */}
      <View style={styles.challengeVisual}>
        <Text style={styles.challengeIcon}>{icon}</Text>
      </View>

      {/* Challenge Content */}
      <View style={styles.challengeContent}>
        <Text style={styles.challengeTitle}>{title}</Text>
        <Text style={styles.challengeDescription}>{description}</Text>
      </View>
    </Animated.View>
  );
};

// SVG Components for Artery and Blood Cells
const ArterySVG: React.FC = () => {
  const pathLength = useSharedValue(0);

  useEffect(() => {
    pathLength.value = withTiming(1, { duration: 3000 });
  }, []);

  const animatedPathStyle = useAnimatedStyle(() => ({
    strokeDashoffset: interpolate(pathLength.value, [0, 1], [1000, 0]),
  }));

  return (
    <Svg width="100%" height="200" viewBox="0 0 400 200">
      <Defs>
        <Filter id="arteryShadow">
          <FeDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#a30e0e" floodOpacity="0.6" />
        </Filter>
      </Defs>
      <Path
        d="M 0 100 Q 100 50 200 100 T 400 100"
        stroke="#a30e0e"
        strokeWidth="8"
        fill="none"
        strokeDasharray="1000"
        filter="url(#arteryShadow)"
      />
    </Svg>
  );
};

const BloodCellsSVG: React.FC = () => {
  const translateX = useSharedValue(-100);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(screenWidth * 2, { duration: 4000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.bloodCellsContainer, animatedStyle]}>
      <Svg width="100%" height="200" viewBox="0 0 400 200">
        <Defs>
          <Filter id="bloodCellShadow">
            <FeDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ff0000" floodOpacity="0.8" />
          </Filter>
        </Defs>
        {/* Blood cells */}
        <Circle cx="50" cy="100" r="8" fill="#ff0000" filter="url(#bloodCellShadow)" />
        <Circle cx="150" cy="95" r="6" fill="#ff0000" filter="url(#bloodCellShadow)" />
        <Circle cx="250" cy="105" r="7" fill="#ff0000" filter="url(#bloodCellShadow)" />
        <Circle cx="350" cy="98" r="5" fill="#ff0000" filter="url(#bloodCellShadow)" />
      </Svg>
    </Animated.View>
  );
};

const ChallengesSection: React.FC = () => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const challenges = [
    {
      title: "Financial Burden",
      description: "Kidney disease treatment costs can be overwhelming, with dialysis alone costing over $90,000 annually.",
      icon: "💰"
    },
    {
      title: "Diagnostic Challenges", 
      description: "Early detection is difficult, with many patients unaware they have kidney disease until it's advanced.",
      icon: "🔬"
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.challengesBlock}>
        {/* Curved Artery Flow Animation */}
        <View style={styles.curvedArteryContainer}>
          <View style={styles.curvedArteryPath}>
            <ArterySVG />
          </View>
          <BloodCellsSVG />
        </View>

        <Animated.View style={[styles.challengesHeader, animatedStyle]}>
          <Text style={styles.challengesHeadline}>
            The Challenges We Face
          </Text>
        </Animated.View>

        <View style={styles.challengesGrid}>
          {challenges.map((challenge, index) => (
            <ChallengeCard
              key={index}
              title={challenge.title}
              description={challenge.description}
              icon={challenge.icon}
              index={index}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  challengesBlock: {
    width: '100%',
    paddingVertical: screenHeight * 0.2, // 20vh equivalent
    paddingBottom: screenHeight * 0.15, // 15vh equivalent
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  curvedArteryContainer: {
    position: 'absolute',
    top: 0,
    left: -screenWidth * 0.5, // -50vw
    width: screenWidth * 2, // 200vw
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
  },
  curvedArteryPath: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: 200,
    transform: [{ translateY: -100 }], // translateY(-50%)
  },
  bloodCellsContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: 200,
    transform: [{ translateY: -100 }],
    zIndex: 10,
  },
  challengesHeader: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    marginBottom: screenHeight * 0.06, // 6vh
    paddingHorizontal: 32, // 2rem
    zIndex: 10,
  },
  challengesHeadline: {
    color: '#2c3e50',
    lineHeight: 1.4,
    fontSize: 35, // 2.2rem
    fontWeight: '600',
    marginBottom: 24, // 1.5rem
    letterSpacing: -0.32, // -0.02em
    textAlign: 'center',
  },
  challengesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 64, // 4rem
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 32, // 2rem
    zIndex: 10,
  },
  challengeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 48, // 3rem
    paddingHorizontal: 40, // 2.5rem
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 60,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    width: screenWidth * 0.9,
    maxWidth: 450,
    marginBottom: 16,
  },
  challengeBeam: {
    position: 'absolute',
    width: 4,
    height: '100%',
    opacity: 0,
  },
  beamLeft: {
    left: 20,
  },
  beamRight: {
    right: 20,
  },
  challengeVisual: {
    width: 120,
    height: 120,
    marginBottom: 32, // 2rem
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
    shadowColor: '#a30e0e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
  },
  challengeIcon: {
    fontSize: 48, // 3rem
    filter: 'grayscale(100%) brightness(0) invert(1)',
  },
  challengeContent: {
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 29, // 1.8rem
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16, // 1rem
    letterSpacing: -0.16, // -0.01em
    textAlign: 'center',
  },
  challengeDescription: {
    fontSize: 16, // 1rem
    lineHeight: 25.6, // 1.6
    color: '#5a6c7d',
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default ChallengesSection;
