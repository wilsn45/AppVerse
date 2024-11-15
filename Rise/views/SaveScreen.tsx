import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { categories } from '../Data/CategoryData';
import { SaveHandler } from '../Handlers/SaveHandler';

const SaveScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0); // Default category is 'All' with ID 0
  const [allSavedCards, setAllSavedCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);

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

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleRemoveCard = async (categoryId, contentId) => {
    try {
      await SaveHandler.removeSave(categoryId, contentId);
      fetchSavedCards(); // Refresh the saved cards after removal
    } catch (error) {
      console.error('Error removing card:', error);
    }
  };

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

      {/* Content */}
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.contentId}
        renderItem={({ item }) => (
          <View style={[styles.cardContainer, { width: deviceWidth - 20 }]}>
            <Text style={styles.cardTitle}>{item.contentTitle}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveCard(item.categoryId, item.contentId)}
              style={styles.removeButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
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
  flatListContainer: {
    paddingBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 8,
    alignSelf: 'center',
    backgroundColor: '#1c1c1c',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
    flexWrap: 'wrap', // Allow text to wrap
  },
  removeButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SaveScreen;
