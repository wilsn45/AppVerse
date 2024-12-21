import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProfileHandler from '../../Handlers/ProfileHandler';
import firestore from '@react-native-firebase/firestore';
import { HomeHandler } from '../../Handlers/HomeHandler';
import { CategoryHandler } from '../../Handlers/CategoryHandler';
import { AnalyticsHelper, ActionType } from '../../Analytics/AnalyticsHelper';

const SplashScreen = () => {
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
       // sendSplashImpressionEvent();

        const fetchHomeData = async () => {
            try {
                // Fetch category list from Home collection
                const categorySnapshot = await firestore().collection('Home').get();

                // Sort categories by index in ascending order
                const categories = categorySnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        name: doc.data().name,
                        index: doc.data().index,
                    }))
                    .sort((a, b) => a.index - b.index);

                const Home = {};

                //console.log("Categories", categories)

                for (const category of categories) {
                    const collectionName = category.id;
                    const colRef = firestore().collection(`Home/${collectionName}/List`);
                    const snapshot = await colRef.get();

                    if (collectionName === 'LiveCategories') {
                        Home["Categories"] = snapshot.docs.map(doc => ({
                            id: doc.id,
                            name: doc.data().name
                        }));
                    } else {
                        Home[category.name] = snapshot.docs.map(doc => ({
                            id: doc.id,
                            title: doc.data().title,
                            description: doc.data().description,
                            imageUrl: doc.data().imageUrl,
                            thumbnail: doc.data().thumbnail,
                            likeCount: doc.data().likeCount,
                            category: doc.data().categoryTitle,
                            categoryId: doc.data().categoryId,
                            readMin: doc.data().readMin
                        }));
                    }
                }

               //console.log('Fetched Data:', Home);
               // sendCategoryFetchEvent();

                // Save LiveCategories using CategoryHandler
                await HomeHandler.setHomeData(Home)
                await CategoryHandler.setLiveCategory(Home["Categories"])

                //console.log("Data saved successfully.");
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
               checkOnboardingStatus();
               setLoading(false);
            }
        };

        const checkOnboardingStatus = async () => {
            try {
                const isOnboarded = await ProfileHandler.getIsOnboarded();
               // console.log('is onboarded:', isOnboarded);
                if (isOnboarded) {
                    sendNavigateToHomeEvent();
                    navigation.navigate('HomeTabNavigator');
                } else {
                    sendNavigateToLetsStartEvent();
                    navigation.navigate('LetsStartScreen');
                }
            } catch (error) {
                console.error("Error checking onboarding status:", error);
            }
        };

        fetchHomeData();
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
