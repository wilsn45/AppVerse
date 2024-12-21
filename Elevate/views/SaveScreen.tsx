import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Dimensions, Image, TextInput, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { CategoryHandler } from '../Handlers/CategoryHandler';
import { SaveHandler } from '../Handlers/SaveHandler';
import DropDownList from './Common/DropDownList';
import theme from '../Theme/Theme';
import { AnalyticsHelper, ActionType } from '../Analytics/AnalyticsHelper';
import { Swipeable } from 'react-native-gesture-handler';

const SaveScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [allSavedCards, setAllSavedCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchedCards, setSearchedCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

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
      console.log('Saved Card', savedCards)
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
    setSearchedCards(updatedCards)
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


  const handleSearch = (query: string) => {
    setSearchQuery(query);

    const filtered = filteredCards.filter((item) =>
      item.contentTitle.toLowerCase().includes(query.toLowerCase())
    );
    setSearchedCards(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchedCards(filteredCards);
  };


  const handleDelete = (contentId: string) => {
    //setCards(cards.filter((card) => card.contentId !== contentId));
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation, item: any) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveCard(item.categoryId, item.contentId)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={30} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

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

      <View style={styles.searchBar}>
        {/* Search Icon */}
        <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />

        <TextInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search by title..."
          placeholderTextColor="#aaa"
          style={styles.searchInput}
        />

        {/* Cross Button */}
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close" size={20} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={searchedCards}
        keyExtractor={(item) => item.contentId}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={(progress) => renderRightActions(progress, item)}
          >
          <TouchableOpacity
            style={[styles.cardView]}
            onPress={() => handleCardPress(item.contentTitle, item.contentId, item.categoryId)}
            accessibilityLabel={`Open details for ${item.contentTitle}`}
            accessibilityRole="button"
          >
           <View style = {styles.leftCardView}>
                <Text style={styles.cardTitle}  
                      numberOfLines={3} 
                     ellipsizeMode="tail" >{item.contentTitle}</Text>
                <View style = {styles.leftBottomView}>
                 <Text style={styles.cardCategoryText}>{item.categoryTitle}</Text>
                 <Text style={styles.cardReadMeText}>{item.readMin} min read</Text>
                </View>
              </View>
              
              <View style = {styles.rightCardView}>
              <Image 
                source={{ uri: item.thumbnail }} 
                style={styles.tileImage} 
               />
                
            </View>
            
           
          </TouchableOpacity>
          </Swipeable>
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
    backgroundColor: theme.colors.backgroundWhite,
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
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  flatListContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  separator: {
    height: 10,
  },
  cardTitle: {
    color: theme.colors.black,
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
  removeButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardView: {
    //backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderGrey2,
    height: 110
  },
  leftCardView: {
    flex: 0.9,
   // backgroundColor: 'red',
    flexDirection: 'column',
    gap: 10
  },
  leftBottomView: {
    width: 200,
    gap: 4,
    alignItems: 'center',
    flexDirection: 'row',
  },
  rightCardView: {
    //backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardCategoryText: {
    color: theme.colors.textGrey1,
    fontWeight: '600',
    fontSize: 14,
  },
  cardReadMeText: {
    color: theme.colors.textGrey1,
    fontSize: 12,
  },
  tileImage: {
    width: 90,
    height: 70,
    borderRadius: 5,
    marginBottom: 5, // Space between image and button
    resizeMode: 'cover',
  },

  searchBar: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    margin: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundGrey3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 10,
    paddingVertical: 5,
  },
});

export default SaveScreen;
