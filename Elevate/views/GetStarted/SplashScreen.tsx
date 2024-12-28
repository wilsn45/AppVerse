import React, { useEffect, useState, useRef } from 'react';
import { Animated, Image, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileHandler from '../../Handlers/ProfileHandler';
import { SplashAnalytics } from '../../Analytics/SplashAnalytics';

const SplashScreen = () => {
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const analytics = new SplashAnalytics()


 const moveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    analytics.sendSplashImpressionEvent()
    // Start the animation sequence after 1 second delay
    Animated.sequence([
      Animated.delay(0), // Wait for 1 second
      Animated.parallel([
        // Animate vertical movement upwards
        Animated.timing(moveAnim, {
          toValue: -400,  // Move the image 200 points upwards
          duration: 2000,  // Duration of 1 second
          useNativeDriver: true, // Use native driver for performance
        }),
        // Fade out the image
        Animated.timing(fadeAnim, {
          toValue: 0,  // Make the image invisible
          duration: 2000, // Duration of 1 second
          useNativeDriver: true, // Use native driver for performance
        }),
      ]),
    ]).start(() => {
      // After the animation ends, navigate to the next screen
     
        analytics.sendNavigateToHomeEvent();
       navigation.navigate('HomeTabNavigator');
    });
  }, []);

    return (
        <View style={styles.container}>
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
        </View>
      );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white', // Set the background to white
    },
    image: {
      width: 150, // Adjust the width as per your image size
      height: 150, // Adjust the height as per your image size
      position: 'absolute',
      top: '50%', // Center the image horizontally and vertically
      left: '50%',
      marginLeft: -75, // Offset for exact center alignment
      marginTop: -75, // Offset for exact center alignment
    },
  });
  

export default SplashScreen;
