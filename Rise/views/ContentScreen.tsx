import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SaveHandler } from '../Handlers/SaveHandler';

const { height } = Dimensions.get('window');

// Sample content data for each category
const financeContent = [
  { id: '11', title: 'Finance Tip 1: Budgeting' },
  { id: '12', title: 'Finance Tip 2: Saving' },
  { id: '13', title: 'Finance Tip 3: Investing' },
  { id: '14', title: 'Finance Tip 4: Debt Management' },
];

const focusContent = [
  { id: '21', title: 'Focus Tip 1: Time Management' },
  { id: '22', title: 'Focus Tip 2: Eliminate Distractions' },
  { id: '23', title: 'Focus Tip 3: Goal Setting' },
  { id: '24', title: 'Focus Tip 4: Prioritizing Tasks' },
];

const mindContent = [
  { id: '31', title: 'Mind Tip 1: Meditation' },
  { id: '32', title: 'Mind Tip 2: Journaling' },
  { id: '33', title: 'Mind Tip 3: Self-care Routines' },
  { id: '34', title: 'Mind Tip 4: Stress Management' },
];

const fitContent = [
  { id: '41', title: 'Fit Tip 1: Regular Exercise' },
  { id: '42', title: 'Fit Tip 2: Balanced Diet' },
  { id: '43', title: 'Fit Tip 3: Hydration' },
  { id: '44', title: 'Fit Tip 4: Sleep Well' },
];

const ContentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tileType, categoryId } = route.params;
  const [contentList, setContentList] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    // Set content list based on tileType
    switch (tileType) {
      case 'Finance':
        setContentList(financeContent);
        break;
      case 'Focus':
        setContentList(focusContent);
        break;
      case 'Mind':
        setContentList(mindContent);
        break;
      case 'Fit':
        setContentList(fitContent);
        break;
      default:
        setContentList([]);
    }
  }, [tileType]);

  useEffect(() => {
    // Dynamically set the header title based on the category
    navigation.setOptions({
      title: tileType, // Set title to the category name (Finance, Focus, etc.)
    });
    
    // Check if cards are saved and update button state
    const loadSavedCards = async () => {
      const savedItems = await SaveHandler.getSaves();
      const savedContentIds = savedItems[categoryId] || [];
      const updatedSavedCards = new Map();
      contentList.forEach((item) => {
        // Use both contentId and contentTitle to check if the card is saved
        updatedSavedCards.set(item.id, savedContentIds.some((savedCard) => savedCard.contentId === item.id));
      });
      setSavedCards(updatedSavedCards);
    };

    if (contentList.length > 0) {
      loadSavedCards();
    }
  }, [contentList, categoryId, navigation, tileType]);

  const handleSave = async (itemId: string, itemTitle: string) => {
    const isSaved = savedCards.get(itemId);
    if (isSaved) {
      // If already saved, remove save
      await SaveHandler.removeSave(categoryId, itemId);
      setSavedCards((prev) => new Map(prev).set(itemId, false));
    } else {
      // If not saved, add save with contentTitle
      await SaveHandler.addSave(categoryId, itemId, itemTitle);
      setSavedCards((prev) => new Map(prev).set(itemId, true));
    }
  };

  const handleCardPress = (item: { id: string, title: string }) => {
    navigation.navigate('ContentDetailScreen', { itemId: item.id, itemTitle: item.title });
  };

  const handleShare = (itemId: string) => {
    console.log(`Shared item with ID: ${itemId}`);
  };

  const handleAddTask = (itemId: string) => {
    console.log(`Added item with ID: ${itemId} to tasks`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={contentList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <TouchableOpacity onPress={() => handleCardPress(item)} style={styles.cardContent}>
              <Text style={styles.contentText}>{item.title}</Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              {/* Save Button */}
              <TouchableOpacity style={styles.iconButton} onPress={() => handleSave(item.id, item.title)}>
                <Ionicons
                  name={savedCards.get(item.id) ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={savedCards.get(item.id) ? 'red' : 'white'}
                />
              </TouchableOpacity>
              {/* Share Button */}
              <TouchableOpacity style={styles.iconButton} onPress={() => handleShare(item.id)}>
                <Ionicons name="share-outline" size={24} color="white" />
              </TouchableOpacity>
              {/* Add Task Button */}
              <TouchableOpacity style={styles.iconButton} onPress={() => handleAddTask(item.id)}>
                <MaterialIcons name="add-task" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        pagingEnabled
        snapToInterval={height * 0.8 + 20}
        snapToAlignment="center"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cardContainer: {
    height: height * 0.8,
    width: '90%',
    backgroundColor: '#333',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 10,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  iconButton: {
    padding: 10,
  },
});

export default ContentScreen;
