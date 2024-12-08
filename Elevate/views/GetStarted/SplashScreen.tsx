import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileHandler from '../../Handlers/ProfileHandler'; // Import your ProfileHandler or logic for checking onboarding status
import firestore from '@react-native-firebase/firestore';
import { CategoryHandler } from '../../Handlers/CategoryHandler'; // Import CategoryHandler
import { AnalyticsHelper, ActionType } from '../../Analytics/AnalyticsHelper';

const SplashScreen = () => {
    const [loading, setLoading] = useState(true); // Track loading state
    const navigation = useNavigation(); // For navigation to the next screen

    useEffect(() => {
        sendSplashImpressionEvent()
        const fetchLiveCategory = async () => {
            try {
                // Fetch categories from the updated path
                const snapshot = await firestore().collection('Category').doc('LiveCategory').collection('List').get();
                
                // Map the fetched documents to include doc.id and category name
                const liveCategories = snapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name, // Assuming the document has a "name" field
                }));
                
                console.log('Live Categories:', liveCategories);

                // Save categories using CategoryHandler's setLiveCategory method
                sendCategoryFetchEvent()
                await CategoryHandler.setLiveCategory(liveCategories);
                console.log("Categories saved successfully.");
            } catch (error) {
                console.error('Error fetching LiveCategory:', error);
                // Optional: Show an error message or retry logic here
            } finally {
                // Once the categories are saved, check the onboarding status
                checkOnboardingStatus();
                setLoading(false);
            }
        };

        const checkOnboardingStatus = async () => {
            try {
                const isOnboarded = await ProfileHandler.getIsOnboarded(); // Replace with your onboarding check logic
                if (isOnboarded) {
                    sendNavigateToHomeEvent()
                    navigation.navigate('HomeTabNavigator'); // Navigate to Home if onboarded
                } else {
                    sendNavigateToLetsStartEvent()
                    navigation.navigate('LetsStartScreen'); // Navigate to onboarding if not onboarded
                }
            } catch (error) {
                console.error("Error checking onboarding status:", error);
            }
        };

        // Fetch categories and then check onboarding status
        fetchLiveCategory();

    }, [navigation]);


    const sendSplashImpressionEvent = async () => {
        await AnalyticsHelper.sendEvent(
          '8.0.0',
          'Splash_Appeared',
          'Splash',
          '',
          ActionType.IMPRESSION,
          '',
          {}
        );
      };

      const sendCategoryFetchEvent = async () => {
        await AnalyticsHelper.sendEvent(
          '8.0.0.1',
          'Categories_Fetched',
          'Splash',
          '',
          ActionType.IMPRESSION,
          '',
          {}
        );
      };

      const sendNavigateToLetsStartEvent = async () => {
        await AnalyticsHelper.sendEvent(
          '8.1.0.1',
          'Navigate_LetsStart',
          'Splash',
          '',
          ActionType.IMPRESSION,
          '',
          {}
        );
      };

      const sendNavigateToHomeEvent = async () => {
        await AnalyticsHelper.sendEvent(
          '8.1.0.2',
          'Navigate_Home',
          'Splash',
          '',
          ActionType.IMPRESSION,
          '',
          {}
        );
      };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to Elevate</Text>
            {loading && <ActivityIndicator size="large" color="#2355CA" />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2355CA',
    },
    text: {
        fontSize: 24,
        color: '#FFF',
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default SplashScreen;
