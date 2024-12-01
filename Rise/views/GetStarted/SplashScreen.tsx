import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import ProfileHandler from '../../Handlers/ProfileHandler'; // Import your ProfileHandler or logic for checking onboarding status

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Function to check if the user is onboarded
    const checkOnboardingStatus = async () => {
      try {
        const isOnboarded = await ProfileHandler.getIsOnboarded(); // Replace with your onboarding check logic
        if (isOnboarded) {
          navigation.navigate('HomeTabNavigator'); // Navigate to Home if onboarded
        } else {
          navigation.navigate('LetsStartScreen'); // Navigate to onboarding if not onboarded
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading...</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default SplashScreen;
