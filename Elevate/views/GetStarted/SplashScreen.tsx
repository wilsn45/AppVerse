import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileHandler from '../../Handlers/ProfileHandler';
import { AnalyticsHelper, ActionType } from '../../Analytics/AnalyticsHelper';

const SplashScreen = () => {
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
       sendNavigateToHomeEvent();
       navigation.navigate('HomeTabNavigator');
       
        // const checkOnboardingStatus = async () => {
        //     try {
        //         // const isOnboarded = await ProfileHandler.getIsOnboarded();
        //        // console.log('is onboarded:', isOnboarded);
        //        sendNavigateToHomeEvent();
        //        navigation.navigate('HomeTabNavigator');
        //         // if (isOnboarded) {
        //         //     sendNavigateToHomeEvent();
        //         //     navigation.navigate('HomeTabNavigator');
        //         // } else {
        //         //     sendNavigateToLetsStartEvent();
        //         //     navigation.navigate('LetsStartScreen');
        //         // }
        //     } catch (error) {
        //         console.error("Error checking onboarding status:", error);
        //     }
        // };
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
