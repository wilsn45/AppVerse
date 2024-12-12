import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { CategoryHandler } from '../Handlers/HomeHandler';
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

  useEffect(() => {
    sendSaveImpressionEvent(selectedCategory);
    const fetchCategories = async () => {
      try {
        const liveCategories = await CategoryHandler.getLiveCategory();
        setCategories(liveCategories);
        sendCategoryDisplayedEvent(selectedCategory);
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

  useFocusEffect(
    React.useCallback(() => {
      fetchSavedCards();
    }, [])
  );

  useEffect(() => {
    const updatedCards = allSavedCards.filter(
      (card) => selectedCategory === 0 || card.categoryId === selectedCategory.toString()
    );
    setFilteredCards(updatedCards);
  }, [selectedCategory, allSavedCards]);

  const handleRemoveCard = async (categoryId, contentId) => {
    try {
      sendContentRemovedEvent(categoryId, contentId);
      await SaveHandler.removeSave(categoryId, contentId);
      fetchSavedCards();
    } catch (error) {
      console.error('Error removing card:', error);
    }
  };

  const handleCardPress = (itemTitle, itemId, categoryId) => {
    sendContentOpenEvent(categoryId, itemId);
    navigation.navigate('ContentDetailScreen', { itemTitle, itemId, categoryId });
  };

  const handleCategorySelect = (categoryID) => {
    setSelectedCategory(categoryID);
    sendCategoryClickedEvent(categoryID);
  };

  const categoryOptions = [
    { id: 0, title: 'All' },
    ...categories.map((category) => ({
      id: category.id,
      title: category.name,
    })),
  ];

  const deviceWidth = Dimensions.get('window').width;

  const sendSaveImpressionEvent = async (selectedCategoryId) => {
    await AnalyticsHelper.sendEvent(
      '2.0.0',
      'Save_Appeared',
      'Save',
      '',
      ActionType.IMPRESSION,
      '',
      { selectedCategoryId }
    );
  };

  const sendCategoryDisplayedEvent = async (selectedCategoryId) => {
    await AnalyticsHelper.sendEvent(
      '2.1.0',
      'Content_Lis_Presented',
      'Save',
      'Content_List',
      ActionType.IMPRESSION,
      '',
      { selectedCategoryId }
    );
  };

  const sendContentOpenEvent = async (categoryId, contentId) => {
    await AnalyticsHelper.sendEvent(
      '2.1.1.1',
      'Content_Clicked',
      'Save',
      'Content_List',
      ActionType.CLICK,
      'Open',
      { categoryId, contentId }
    );
  };

  const sendContentRemovedEvent = async (categoryId, contentId) => {
    await AnalyticsHelper.sendEvent(
      '2.1.1.2',
      'Content_Save_Removed',
      'Save',
      'Content_List',
      ActionType.CLICK,
      'Delete',
      { categoryId, contentId }
    );
  };

  const sendCategoryClickedEvent = async (categoryId) => {
    await AnalyticsHelper.sendEvent(
      '2.2.1',
      'Categoy_Filter_Selected',
      'Save',
      'Category_Filter',
      ActionType.CLICK,
      '',
      { categoryId }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Saved
      </Text>
      <View style={styles.dropdownContainer}>
        <DropDownList
          source={'Save_Category'}
          data={categoryOptions}
          defaultId={selectedCategory}
          onSelection={(value) => handleCategorySelect(value)}
          accessibilityLabel="Filter saved items by category"
          accessibilityRole="combobox"
        />
      </View>

      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.contentId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.cardContainer, { width: deviceWidth - 20 }]}
            onPress={() => handleCardPress(item.contentTitle, item.contentId, item.categoryId)}
            accessibilityLabel={`Open details for ${item.contentTitle}`}
            accessibilityRole="button"
          >
            <Text style={styles.cardTitle}>{item.contentTitle}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveCard(item.categoryId, item.contentId)}
              style={styles.removeButton}
              accessibilityLabel={`Remove ${item.contentTitle} from saved items`}
              accessibilityRole="button"
            >
              <Ionicons name="close" size={18} color={theme.colors.grey2} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.flatListContainer}
        accessibilityLabel="List of saved items"
        accessibilityRole="list"
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
    marginTop: 10,
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  separator: {
    height: 10,
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
