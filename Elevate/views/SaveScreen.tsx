import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { CategoryHandler } from '../Handlers/CategoryHandler'; 
import { SaveHandler } from '../Handlers/SaveHandler';
import DropDownList from './Common/DropDownList'; 
import theme from '../Theme/Theme';
import { AnalyticsHelper, ActionType } from '../Analytics/AnalyticsHelper';

const SaveScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [allSavedCards, setAllSavedCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

  // Fetch saved cards from the SaveHandler

  useEffect(() => {
    sendSaveImpressionEvent(selectedCategory)
    const fetchCategories = async () => {
      try {
        const liveCategories = await CategoryHandler.getLiveCategory();  // Fetch categories from CategoryHandler
        setCategories(liveCategories);
        sendCategoryDisplayedEvent(selectedCategory)
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    fetchCategories();
  }, [navigation]);

  const fetchSavedCards = async () => {
    try {
      const savedCards = await SaveHandler.getSavedCards();
      setAllSavedCards(savedCards);
    } catch (error) {
      console.error('Error fetching saved cards:', error);
    }
  };

  // Re-fetch saved cards on screen focus
  useFocusEffect(
    React.useCallback(() => {
      fetchSavedCards();
    }, [])
  );

  // Update filtered cards when category or saved cards change
  useEffect(() => {
    const updatedCards = allSavedCards.filter(
      (card) => selectedCategory === 0 || card.categoryId === selectedCategory.toString()
    );
    setFilteredCards(updatedCards);
  }, [selectedCategory, allSavedCards]);

  // Handle card removal
  const handleRemoveCard = async (categoryId, contentId) => {
    try {
      sendContentRemovedEvent(categoryId,contentId)
      await SaveHandler.removeSave(categoryId, contentId);
      fetchSavedCards(); // Re-fetch saved cards after removal
    } catch (error) {
      console.error('Error removing card:', error);
    }
  };

  // Navigate to content detail page on cell click
  const handleCardPress = (itemTitle, itemId, categoryId) => {
    sendContentOpenEvent(categoryId,itemId)
    navigation.navigate('ContentDetailScreen', { itemTitle, itemId, categoryId }); // Pass itemTitle and itemId to the ContentDetailScreen
  };


  const handleCategorySelect  = (categoryID) => {
      setSelectedCategory(categoryID)
      sendCategoryClickedEvent(categoryID)
  }

  // Dropdown options for category filtering
  const categoryOptions = [
    { id: 0, title: 'All' },
    ...categories.map((category) => ({
      id: category.id,
      title: category.name,
    })),
  ];

  const deviceWidth = Dimensions.get('window').width;


  //ANalytics Events
  const sendSaveImpressionEvent = async (filteredCategoryId: number) => {
    await AnalyticsHelper.sendEvent(
      '2.0.0',
      'Save_Appeared',
      'Save',
      '',
      ActionType.IMPRESSION,
      '',
      {'filteredCategoryId': filteredCategoryId }
    );
  };

  const sendCategoryDisplayedEvent = async (filteredCategoryId: number) => {
    await AnalyticsHelper.sendEvent(
      '2.1.0',
      'Content_Lis_Presented',
      'Save',
      'Category_List',
      ActionType.IMPRESSION,
      '',
      {'filteredCategoryId': filteredCategoryId }
    );
  };

  const sendContentOpenEvent = async (categoryId: string, contentId: String) => {
    await AnalyticsHelper.sendEvent(
      '2.1.1.1',
      'Content_Clicked',
      'Save',
      'Category_List',
      ActionType.CLICK,
      'Open',
      {'categoryId': categoryId, 'contentId': categoryId }
    );
  };

  const sendContentRemovedEvent = async (categoryId: string, contentId: String) => {
    await AnalyticsHelper.sendEvent(
      '2.1.1.2',
      'Content_Save_Removed',
      'Save',
      'Category_List',
      ActionType.CLICK,
      'Delete',
      {'categoryId': categoryId, 'contentId': categoryId }
    );
  };


  const sendCategoryClickedEvent = async (categoryId: string) => {
    await AnalyticsHelper.sendEvent(
      '2.2.1',
      'Categoy_Filter_Selected',
      'Save',
      '',
      ActionType.CLICK,
      '',
      {'categoryId': categoryId }
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Dropdown Component */}
      <Text style={styles.title}>Saved</Text>
      <View style={styles.dropdownContainer}>
        <DropDownList
           source={'Save_Category'}
          data={categoryOptions}
          defaultId={selectedCategory}
          onSelection={(value) => handleCategorySelect(value)} // Callback for category selection
        />
      </View>

      {/* FlatList displaying the saved cards */}
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.contentId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.cardContainer, { width: deviceWidth - 20 }]}
            onPress={() => handleCardPress(item.contentTitle, item.contentId, item.categoryId)} // Pass the content title and ID
          >
            <Text style={styles.cardTitle}>{item.contentTitle}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveCard(item.categoryId, item.contentId)}
              style={styles.removeButton}
            >
              <Ionicons name="close" size={18} color={theme.colors.grey2} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.flatListContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: 0,
    marginHorizontal: 10,
  },
  dropdownContainer: {
    marginTop: 10, // 10px padding at the top
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  separator: {
    height: 10, // Space between items
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.grey2,
  },
  cardTitle: {
    color: theme.colors.black,
    fontSize: 18,
    flex: 1,
    flexWrap: 'wrap',
  },
  removeButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SaveScreen;
