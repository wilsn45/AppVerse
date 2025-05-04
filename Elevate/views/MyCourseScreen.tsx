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

const MyCourseScreen = () => {
  const [allSavedCourses, setAllSavedCourses] = useState([]);
  const [ongoingCourses, setOngoingCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [searchedCards, setSearchedCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const analytics = new SaveAnalytics()
  const [selectedTab, setSelectedTab] = useState('Saved');


  const fetchSavedCourses = async () => {
    try {
      const savedCourses = await SaveHandler.getSavedCourses();
      setAllSavedCourses(savedCourses);
      console.log('Fetched Saved Card', savedCourses)
    } catch (error) {
      console.error('Error fetching saved cards:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSavedCourses();
    }, [])
  );


  const handleRemoveCard = async (id) => {
    try {
      analytics.sendContentRemovedEvent(categoryId, id);
      await SaveHandler.removeCourse(id);
      fetchSavedCourses();
    } catch (error) {
      console.error('Error removing card:', error);
    }
  };

  const handleCardPress = (course) => {
    analytics.sendContentOpenEvent( course.id);
    navigation.navigate('CourseScreen', { course: course });
  };


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

  const getCardsForSelectedTab = () => {
    let cards = [];
    if (selectedTab === 'Saved') cards = allSavedCourses;
    else if (selectedTab === 'Ongoing') cards = ongoingCourses;
    else if (selectedTab === 'Completed') cards = completedCourses;

    return cards.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredCards = getCardsForSelectedTab();
  const isSavedTab = selectedTab === 'Saved';


  const handleDelete = (contentId: string) => {
    //setCards(cards.filter((card) => card.contentId !== contentId));
  };

  const renderRightActions = (_: any, item: any) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveCard(item.categoryId, item.id)}
      >
        <Ionicons name="trash" size={30} color={theme.colors.white} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
    {/* <View style={styles.dropdownContainer}>
      <DropDownList
        source={'Save_Category'}
        data={categoryOptions}
        defaultId={selectedCategory}
        onSelection={handleCategorySelect}
        accessibilityLabel="Filter saved items by category"
        accessibilityRole="combobox"
      />
    </View> */}

    {/* Tab Bar */}
    <View style={styles.tabBarContainer}>
  {['Saved', 'Ongoing', 'Completed'].map((tab) => {
    const isSelected = selectedTab === tab;
    return (
      <TouchableOpacity
        key={tab}
        onPress={() => setSelectedTab(tab)}
        style={styles.tabItem}
        accessibilityRole="button"
        accessibilityLabel={`View ${tab} courses`}
      >
        <Text
          style={[
            styles.tabItemText,
            isSelected && styles.tabItemTextSelected,
          ]}
        >
          {tab}
        </Text>
        {isSelected && <View style={styles.tabIndicator} />}
      </TouchableOpacity>
    );
  })}
</View>

    {/* Search Bar */}
    <View style={styles.searchBar}>
      <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />

      <TextInput
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search by title..."
        placeholderTextColor="#aaa"
        style={styles.searchInput}
      />

      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
          <Ionicons name="close" size={20} color="#aaa" />
        </TouchableOpacity>
      )}
    </View>

    <FlatList
      data={filteredCards}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Swipeable
        renderRightActions={(progress, dragX) => renderRightActions(progress, item)}
      >
        <TouchableOpacity
          style={[styles.cardView]}
          onPress={() => handleCardPress(item)}
          accessibilityLabel={`Open details for ${item.title}`}
          accessibilityRole="button"
        >
          <View style={styles.leftCardView}>
            <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Text>

            <View style={styles.leftBottomView}>
              <View style={styles.tagContainer}>
                <Text style={styles.cardCategoryText}>{item.topic}</Text>
               </View>

               {item.isLiveCourse ? (
                  <Text style={styles.liveText}>LIVE</Text>
                ) : isSavedTab ? (
                   <Text style={styles.cardMetaText}>{item.duration} </Text>
                ) : (
                  <Text style={styles.cardMetaText}>{item.chapterCount} chapters</Text>
                 )}
            </View>
            
          </View>
      
          <View style={styles.rightCardView}>
            <Image source={{ uri: item.thumbnail }} style={styles.tileImage} />
          </View>
        </TouchableOpacity>
      </Swipeable>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={
        filteredCards.length === 0 ? styles.emptyContainer : styles.taskList
      }
      ListEmptyComponent={
        <View style={styles.noTaskView}>
          <Text style={styles.emptyText}>Nothing here yet...</Text>
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
  tabBarContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.greyLight2,
    marginVertical: 10,
  },
  cardView: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 10,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    height: 100,
  },
  
  leftCardView: {
    flex: 1,
    marginRight: 15,
    justifyContent: 'space-between',
    height: 80,
  },
  
  rightCardView: {
    width: 80,
    height: 80,
  },
  
  tileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  cardCategoryText: {
    fontSize: 12,
    color: '#555',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  
  cardMetaText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  
  liveText: {
    fontSize: 12,
    color: 'red',
    fontWeight: 'bold',
    marginTop: 4,
  },
  
  tabItem: {
    flex: 1, // This divides all items equally
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  
  tabItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.secondaryThemeDisabled,
  },
  
  tabItemTextSelected: {
    color: theme.colors.secondaryTheme || theme.colors.primary,
  },
  
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 1,
    width: '100%',
    backgroundColor: theme.colors.secondaryTheme,
  },
  dropdownContainer: {
    marginTop: 10,
    alignSelf: 'flex-end',
    marginBottom: 10,
    marginHorizontal: 10,
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
  taskList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  noTaskView: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.greyLight3,
  },
  leftBottomView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  } ,


  separator: {
    height: 1,
    backgroundColor: theme.colors.grey2,
    marginHorizontal: 10, // Optional: match your card padding
  },
  
});

export default MyCourseScreen;
