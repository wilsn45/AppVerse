import React, { useEffect, useState, useRef } from 'react';
import { Animated, Image, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileHandler from '../../Handlers/ProfileHandler';
import { SplashAnalytics } from '../../Analytics/SplashAnalytics';

const SplashScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const analytics = new SplashAnalytics();

  const moveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const backgroundColorAnim = useRef(new Animated.Value(0)).current; // Animated value for background color
  const textOpacityAnim = useRef(new Animated.Value(0)).current; // Animated value for label opacity

  useEffect(() => {
    analytics.sendSplashImpressionEvent();

    // Start the animation sequence
    Animated.sequence([
      Animated.delay(0), // Wait for 0 seconds
      Animated.parallel([
        // Animate vertical movement upwards
        Animated.timing(moveAnim, {
          toValue: -400, // Move the image 400 points upwards
          duration: 1000, // Duration of 1 second
          useNativeDriver: true,
        }),
        // Fade out the image
        Animated.timing(fadeAnim, {
          toValue: 0, // Make the image invisible
          duration: 1000, // Duration of 1 second
          useNativeDriver: true,
        }),
      ]),
      // After the above animation ends, animate the background color and show the label
      Animated.parallel([
        Animated.timing(backgroundColorAnim, {
          toValue: 1, // Transition to theme color
          duration: 1000, // Duration of background color animation
          useNativeDriver: false, // Can't use native driver for color interpolation
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 1, // Show the label
          duration: 1000, // Duration to match background color transition
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // After all animations end, navigate to the next screen without animation
      analytics.sendNavigateToHomeEvent();
      navigation.navigate('HomeTabNavigator', {
        screen: 'Home',
        params: {
          animationEnabled: false,
        },
        merge: true,
      });
    });
  }, []);

  // Interpolating the background color from 0 to the theme color (#DD4F5A)
  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', '#DD4F5A'], // Initial color is white, then change to theme color
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Animated.Image
        source={require('../../assets/images/Logo.png')} // Replace with your image path
        style={[
          styles.image,
          {
            transform: [{ translateY: moveAnim }],
            opacity: fadeAnim,
          },
        ]}
      />
      <Animated.Text
        style={[
          styles.label,
          {
            opacity: textOpacityAnim, // Bind opacity to text animation
          },
        ]}
      >
        Lets Upward
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    backgroundColor: 'white', // Set the initial background to white
  },
  image: {
    width: 150, // Adjust the width as per your image size
    height: 150, // Adjust the height as per your image size
    position: 'absolute', // Allow positioning to move image
    top: '50%', // Center the image horizontally and vertically
    left: '50%',
    marginLeft: -75, // Offset for exact center alignment
    marginTop: -75, // Offset for exact center alignment
  },
  label: {
    fontSize: 30, // Adjust font size
    color: 'white', // Label font color
    textAlign: 'center',
    fontWeight: '800',
    position: 'absolute', // Center the label absolutely
  },
});

export default SplashScreen;
