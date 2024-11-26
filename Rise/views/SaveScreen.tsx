import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { useFocusEffect } from '@react-navigation/native';
import { categories } from '../Data/CategoryData';
import { SaveHandler } from '../Handlers/SaveHandler';
import theme from '../Theme/Theme';

const SaveScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [allSavedCards, setAllSavedCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const navigation = useNavigation(); // Hook for navigation

  // Fetch saved cards from the SaveHandler
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

  // Handle category change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Handle card removal
  const handleRemoveCard = async (categoryId, contentId) => {
    try {
      await SaveHandler.removeSave(categoryId, contentId);
      fetchSavedCards(); // Re-fetch saved cards after removal
    } catch (error) {
      console.error('Error removing card:', error);
    }
  };

  // Navigate to content detail page on cell click
  const handleCardPress = (itemTitle, itemId) => {
    navigation.navigate('ContentDetailScreen', { itemTitle, itemId }); // Pass itemTitle and itemId to the ContentDetailScreen
  };

  // Dropdown options for category filtering
  const categoryOptions = [
    { label: 'All', value: 0 },
    ...categories.map((category) => ({
      label: category.title,
      value: category.id,
    })),
  ];

  const deviceWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.container}>
      {/* Dropdown menu */}
      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={handleCategoryChange}
          items={categoryOptions}
          value={selectedCategory}
          style={pickerStyles}
          placeholder={{}}
          Icon={() => (
            <Ionicons
              name="chevron-down"
              size={20}
              color="white"
              style={styles.icon}
            />
          )}
        />
      </View>

      {/* FlatList displaying the saved cards */}
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.contentId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.cardContainer, { width: deviceWidth - 20 }]}
            onPress={() => handleCardPress(item.contentTitle, item.contentId)} // Pass the content title and ID
          >
            <Text style={styles.cardTitle}>{item.contentTitle}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveCard(item.categoryId, item.contentId)}
              style={styles.removeButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.flatListContainer}
      />
    </SafeAreaView>
  );
};

const pickerStyles = StyleSheet.create({
  inputIOS: {
    backgroundColor: 'grey',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingRight: 35,
    borderRadius: 5,
    fontSize: 16,
    width: '100%',
    alignSelf: 'stretch',
  },
  inputAndroid: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.black,
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingRight: 35,
    borderRadius: 5,
    fontSize: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.grey2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 10,
  },
  dropdownContainer: {
    marginTop: 10, // 10px padding at the top
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  icon: {
    marginTop: 10,
    width: 20,
    marginRight: 10,
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
