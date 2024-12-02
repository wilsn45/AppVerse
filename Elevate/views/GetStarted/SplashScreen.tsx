import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const SplashScreen = () => {
    const [loading, setLoading] = useState(true); // Track loading state
    const navigation = useNavigation(); // For navigation to the next screen

    useEffect(() => {
        const fetchLiveCategory = async () => {
            try {
                const snapshot = await firestore().collection('LiveCategory').get();
                const liveCategories = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                console.log('Live Categories:', liveCategories);

                // Pass data to the next screen or global state
                navigation.replace('Home', { liveCategories }); // Navigate to Home with data
            } catch (error) {
                console.error('Error fetching LiveCategory:', error);
                // Optional: Show an error message or retry logic here
            } finally {
                setLoading(false);
            }
        };

        fetchLiveCategory();
    }, [navigation]);

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
