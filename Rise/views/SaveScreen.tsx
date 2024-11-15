import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { categories } from '../Data/CategoryData';
import { SaveHandler } from '../Handlers/SaveHandler';

const SaveScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0); // Default category is 'All' with ID 0
  const [allSavedCards, setAllSavedCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);

  // Function to fetch saved cards
  const fetchSavedCards = async () => {
    try {
      const savedCards = await SaveHandler.getSavedCards();
      console.log(`Fetched ${savedCards.length} saved cards`);
      setAllSavedCards(savedCards);
    } catch (error) {
      console.error('Error fetching saved cards:', error);
    }
  };

  // Use useFocusEffect to re-fetch saved cards when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('SaveScreen is focused, fetching saved cards...');
      fetchSavedCards();
    }, [])
  );

  // Update filtered cards whenever selectedCategory or allSavedCards change
  useEffect(() => {
    const updatedCards = allSavedCards.filter(
      (card) => selectedCategory === 0 || card.categoryId === selectedCategory.toString()
    );
    console.log(`Filtered ${updatedCards.length} cards`);
    setFilteredCards(updatedCards);
  }, [selectedCategory, allSavedCards]);

  // Handle category selection change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    console.log('Selected Category ID:', value);
  };

  // Dropdown options with category ID
  const categoryOptions = [
    { label: 'All', value: 0 },
    ...categories.map((category) => ({
      label: category.title,
      value: category.id,
    })),
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Dropdown menu at the top */}
      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={handleCategoryChange}
          items={categoryOptions}
          value={selectedCategory} // Default value is 'All' (0)
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

      {/* Content of the screen */}
      <View style={styles.contentContainer}>
        <FlatList
          data={filteredCards}
          keyExtractor={(item) => item.contentId}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <Text style={styles.cardTitle}>{item.contentTitle}</Text>
            </View>
          )}
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
    </SafeAreaView>
  );
};

const pickerStyles = StyleSheet.create({
  inputIOS: {
    backgroundColor: 'grey',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingRight: 35, // Add right padding to avoid the icon touching the boundary
    borderRadius: 5,
    fontSize: 16,
    width: '100%',
    alignSelf: 'stretch',
  },
  inputAndroid: {
    backgroundColor: 'grey',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingRight: 35, // Add right padding to avoid the icon touching the boundary
    borderRadius: 5,
    fontSize: 16,
    width: '100%',
    alignSelf: 'stretch',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  dropdownContainer: {
    marginTop: 20,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  icon: {
    marginTop: 10,
    width: 20,
    marginRight: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  cardContainer: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
  },
});

export default SaveScreen;
