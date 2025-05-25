import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileDBHandler from '../../DBHandler/ProfileDBHandler';
import { SplashAnalytics } from '../../Analytics/SplashAnalytics';

const SplashScreen = () => {
  const navigation = useNavigation();
  const analytics = new SplashAnalytics();

  const moveAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    analytics.sendSplashImpressionEvent();

    Animated.parallel([
      Animated.timing(moveAnim, {
        toValue: -400,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
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

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/images/Logo.png')}
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
    backgroundColor: 'white',
  },
  image: {
    width: 150,
    height: 150,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -75,
    marginTop: -75,
  },
});

export default SplashScreen;
