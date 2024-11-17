import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // For navigation
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';

const RoutineTaskScreen = () => {
    const route = useRoute();
  const { task } = route.params; // Get TaskData passed from previous screen
  const navigation = useNavigation();

  // Handle navigation to ContentDetailScreen
  const navigateToContentDetail = () => {
    navigation.navigate('ContentDetailScreen', { itemId: task.contentId, itemTitle: task.contentTitle });
  };

  return (
    <View style={styles.container}>
      {/* Rounded corner title */}
      <TouchableOpacity onPress={navigateToContentDetail} style={styles.roundedTitleContainer}>
        <Text style={styles.title}>{task.contentTitle}</Text>
        <Ionicons name="chevron-down" size={24} color="white" />
      </TouchableOpacity>

      {/* Other UI elements */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000'
  },
  roundedTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 8,
    alignSelf: 'center',
    backgroundColor: '#1c1c1c',
   
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RoutineTaskScreen;
