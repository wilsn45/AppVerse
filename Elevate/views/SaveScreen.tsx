import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Dimensions, Image, TextInput, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CategoryHandler } from '../Handlers/CategoryHandler';
import { SaveHandler } from '../Handlers/SaveHandler';
import DropDownList from './Common/DropDownList';
import theme from '../Theme/Theme';
import { SaveAnalytics } from '../Analytics/SaveAnalytics';
import { Swipeable } from 'react-native-gesture-handler';

const SaveScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [allSavedCards, setAllSavedCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchedCards, setSearchedCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const analytics = new SaveAnalytics()

  useEffect(() => {
    analytics.sendSaveImpressionEvent(selectedCategory);
    const fetchCategories = async () => {
      try {
        const liveCategories = await CategoryHandler.getLiveCategory();
        setCategories(liveCategories);
       analytics. sendCategoryDisplayedEvent(selectedCategory);
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
      //console.log('Fetched Saved Card', savedCards)
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

  const handleRemoveCard = async (categoryId, id) => {
    try {
      analytics.sendContentRemovedEvent(categoryId, id);
      await SaveHandler.removeSave(categoryId, id);
      fetchSavedCards();
    } catch (error) {
      console.error('Error removing card:', error);
    }
  };

  const handleCardPress = (content) => {
    console.log("Opening Card", content)
    analytics.sendContentOpenEvent(content.categoryId, content.id);
    navigation.navigate('ContentDetailScreen', { content });
  };

  const handleCategorySelect = (categoryID) => {
    setSelectedCategory(categoryID);
    analytics.sendCategoryClickedEvent(categoryID);
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
      item.title.toLowerCase().includes(query.toLowerCase())
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
        onPress={() => handleRemoveCard(item.categoryId, item.id)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={30} color={theme.colors.white} />
        </Animated.View>
      </TouchableOpacity>
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={(progress) => renderRightActions(progress, item)}
          >
          <TouchableOpacity
            style={[styles.cardView]}
            onPress={() => handleCardPress(item)}
            accessibilityLabel={`Open details for ${item.title}`}
            accessibilityRole="button"
          >
           <View style = {styles.leftCardView}>
                <Text style={styles.cardTitle}  
                      numberOfLines={3} 
                     ellipsizeMode="tail" >{item.title}</Text>
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

        contentContainerStyle={searchedCards.length === 0 ? styles.emptyContainer : styles.taskList}
        ListEmptyComponent={
          <View style={styles.noTaskView}>
           <Text style={styles.emptyText} accessibilityLabel="No Tasks Found">
           No Saved Card
            </Text>
            {/* <Ionicons
                  name={'clipboard-outline'}
                  size={30}
                  color={theme.colors.greyLight3}
                /> */}
          </View>
          
        }
        accessibilityLabel="List of saved items"
        accessibilityRole="list"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
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
    marginTop: 20,
    marginHorizontal: 20,
    paddingBottom: 20,
  },
  taskList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyContainer: {
    flexGrow: 1, // Ensures the empty container takes full space
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', // Match the screen height
  },
  noTaskView: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '500',
    color: theme.colors.greyLight3
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.greyLight,
    height: 120,
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
    color: theme.colors.greyLight3,
    fontWeight: '600',
    fontSize: 14,
  },
  cardReadMeText: {
    color: theme.colors.greyLight3,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    margin: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.greyLight4,
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
    backgroundColor: theme.colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 10,
    paddingVertical: 5,
  },
});

export default SaveScreen;
