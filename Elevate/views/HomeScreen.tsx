import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeHandler } from '../Handlers/HomeHandler'; // Import CategoryHandler
import ProfileHandler from '../Handlers/ProfileHandler'; 
import { AnalyticsHelper, ActionType } from '../Analytics/AnalyticsHelper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SaveHandler } from '../Handlers/SaveHandler.tsx';

import theme from '../Theme/Theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('User');
  const [categories, setCategories] = useState([]);
  const [sectionDataModel, setSectionDataModel] = useState([]);
  const deviceWidth = Dimensions.get('window').width; // Get device width
  const [savedCards, setSavedCards] = useState<Map<string, boolean>>(new Map());

  const leftPadding = 20; // Adjust these values as needed
  const rightPadding = 20;
  const spacing = 10; // Space between tiles

  // Example dynamic data for the horizontal FlatLists
  const categoryData = [];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        sendHomeImpressionEvent();
        const homeData = await HomeHandler.getHome();
        
        const liveCategories = homeData['Categories']

        if (!liveCategories || liveCategories.length === 0) {
          console.log("liveCategories is empty. Exiting function.");
          return; 
        }

        const sortedLiveCategories = liveCategories.sort((a, b) => a.index - b.index);
        
        setCategories(sortedLiveCategories);
        //console.log("Categories", liveCategories)

        const sectionDataArray = [];
        const newSavedCards = new Map();

        console.log("Saved Home Data", homeData)
        for (const key in homeData) {
          if (key !== 'Categories') {
              const data =  homeData[key] 
              const sectionData = {'title': key, 'data':data }
              sectionDataArray.push(sectionData)

              for (const item of data) {
                const isSaved = await SaveHandler.isCardSaved(item.categoryId, item.id);
                newSavedCards.set(item.id, isSaved); 
              }
          }
       }

       setSavedCards(newSavedCards);

      // console.log('SectionDataArray', sectionDataArray)
       setSectionDataModel(sectionDataArray)
       sendCategoryDisplayedEvent(liveCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchUserName = async () => {
      try {
        const userName = await ProfileHandler.getUserName();
        setUserName(userName);
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    const fetchLatestHomeData = async() => {
      let isSuccess = await HomeHandler.fetchLatestHomeData()
      console.log("Latest Home data resp", isSuccess)
      if (isSuccess == true) {
        fetchCategories()
        updateSavedCard()
      }
    }

    fetchCategories();
    fetchUserName();
    fetchLatestHomeData()
  }, [navigation]);


  const updateSavedCard = async () => {
    try {
      const newSavedCards = new Map();
      if (!sectionDataModel || sectionDataModel.length === 0) {
        console.log("sectionDataModel is empty. Exiting function.");
        return; 
      }
  
      for (const section of sectionDataModel) {
        const data = section.data;
  
        // Use a for...of loop to handle async operations properly
        for (const item of data) {
          const isSaved = await SaveHandler.isCardSaved(item.categoryId, item.id);
          newSavedCards.set(item.id, isSaved);
        }
      }
  
      setSavedCards(newSavedCards);
    } catch (error) {
      console.error("Error fetching saved cards:", error);
    }
  };
  
  useFocusEffect(
    React.useCallback(() => {
      updateSavedCard();
    }, [])
  );


  const handleTilePress = (categorytitle: string, id: string) => {
    sendCategoryClickedEvent(id);
    navigation.navigate('ContentScreen', { categorytitle, categoryId: id });
  };

  // Group the categories into rows of 2 tiles
  const groupCategories = () => {
    if (!categories || categories.length === 0) {
      return [];
    }

    const rows = [];
    for (let i = 0; i < categories.length; i += 2) {
      rows.push(categories.slice(i, i + 2)); // Create pairs of categories
    }
    return rows;
  };

  const handleSave = async (itemId, itemTitle, categoryId, categoryTitle, thumbnail,readMin) => {
    const isSaved = savedCards.get(itemId);
    if (isSaved) {
      await SaveHandler.removeSave(categoryId, itemId);
    } else {
      await SaveHandler.addSave(categoryId, itemId, itemTitle, categoryTitle, thumbnail, readMin);
    }
    // Update only the savedCards state here
    setSavedCards((prev) => new Map(prev).set(itemId, !isSaved));
  };

  const renderTile = ({ item }: { item: { id: string; title: string } }) => (
    <TouchableOpacity
    style={[
      styles.tile,
      { width: (deviceWidth - leftPadding - rightPadding - spacing) / 2 },
    ]}
      onPress={() => handleTilePress(item.name, item.id)}
      accessibilityLabel={`Category tile for ${item.name}`}
      accessibilityHint="Tap to view the content in this category"
      accessibilityRole="button"
    >
        <Image 
          source={{ uri: item.thumbnail }} 
          style={styles.categoryTileImage} 
        />
      <Text style={styles.tileText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderHorizontalScrollList = ({ item }: { item: { id: string; title: string, thumbnail: string, category: string, categoryId: string, readMin: string } }) => (
    <TouchableOpacity
    onPress={() =>  handleCardPress(item.title, item.id, item.categoryId)}>
    <View style={styles.horizontalTile}>
      {/* Left Section: Title */}
      <View style={styles.leftSection}>
        <Text style={styles.titleText}
        numberOfLines={3} 
        ellipsizeMode="tail" 
        >{item.title}</Text>
        <View>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.readTimeText}>{item.readMin} min read</Text>
        </View>
        
      </View>
  
      {/* Right Section: Image and Button */}
      <View style={styles.rightSection}>
        <Image 
          source={{ uri: item.thumbnail }} 
          style={styles.tileImage} 
        />

        <TouchableOpacity style={styles.tileSaveButton} onPress={() => handleSave(item.id, item.title, item.categoryId, item.category, item.thumbnail, item.readMin)}
                accessibilityLabel={savedCards.get(item.id) ?`Unsave Card`: 'Save Card'}>
                <Ionicons
                  name={ savedCards.get(item.id) ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={savedCards.get(item.id) ? theme.colors.secondaryTheme : theme.colors.primaryTheme}
                />
                <Text>{savedCards.get(item.id) ? 'Saved': 'Save'}</Text>
          </TouchableOpacity> 
      </View>
    </View>
    </TouchableOpacity>
  );

  const handleCardPress = (itemTitle, itemId, categoryId) => {
    sendContentOpenEvent(categoryId, itemId);
    console.log("itemTitle", itemTitle)
    console.log("itemId", itemId)
    console.log("categoryId", categoryId)
    navigation.navigate('ContentDetailScreen', { itemTitle, itemId, categoryId });
  };

  // Analytics Events
  const sendHomeImpressionEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '1.0.0',
      'Home_Appeared',
      'Home',
      '',
      ActionType.IMPRESSION,
      '',
      {}
    );
  };

  const sendCategoryDisplayedEvent = async (categoryList: [string]) => {
    await AnalyticsHelper.sendEvent(
      '1.1.0',
      'Category_Displayed',
      'Home',
      'Category_List',
      ActionType.IMPRESSION,
      '',
      { category: categoryList }
    );
  };

  const sendCategoryClickedEvent = async (categoryId: string) => {
    await AnalyticsHelper.sendEvent(
      '1.1.1',
      'Category_Clicked',
      'Home',
      'Category_List',
      ActionType.CLICK,
      '',
      { categoryId }
    );
  };

  const sendContentOpenEvent = async (categoryId, contentId) => {
    await AnalyticsHelper.sendEvent(
      '1.2.1',
      'Content_Open',
      'Save',
      'Section_List',
      ActionType.CLICK,
      'Open',
      { categoryId, contentId }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.userNameLabel}>Hi, There!</Text>

        <Text style={styles.categoryLabel}>Categories</Text>
        <FlatList
          data={groupCategories()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.row,
                {
                  justifyContent: item.length === 1 ? 'flex-start' : 'space-between',
                },
              ]}
              accessible={false}
            >
              {item.map((category) => renderTile({ item: category }))}
            </View>
          )}
          keyExtractor={(item) => item[0].id}
          contentContainerStyle={styles.contentContainer}
          scrollEnabled={false} 
        />

        {sectionDataModel.map((section, index) => (
          <View key={index}>
            <Text style={styles.horizontalListTitle}>{section.title}</Text>
            <FlatList
              data={section.data}
              renderItem={renderHorizontalScrollList}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContainer}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundGrey, // Ensures safe area is styled
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 10,
  },
  welcomeLabel: {
    fontSize: 20,
    color: theme.colors.grey1,
    paddingTop: 20,
    paddingLeft: 20,
    textAlign: 'left',
  },
  userNameLabel: {
    fontSize: 20,
    color: theme.colors.black,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingVertical: 15,
    textAlign: 'left',
  },
  categoryLabel: {
    fontSize: 20,
    paddingLeft: 20,
    paddingBottom: 10,
    textAlign: 'left',
    fontWeight: '600',
    color: theme.colors.textHeading,
  },
  contentContainer: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: 10
  },
  tile: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    paddingBottom: 10,
    justifyContent: 'space-between',
    borderColor: theme.colors.borderGrey,
    height: 170,
    shadowColor: theme.colors.shadowGrey,
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.8, 
    shadowRadius: 6, 
    elevation: 8, 
    gap: 10,
  },
  tileText: {
    color: theme.colors.black,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryTileImage: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },

  horizontalListTitle: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: '600',
    color: theme.colors.textHeading,
    paddingLeft: 20, 
  },
  horizontalListContainer: {
    paddingBottom: 20,
  },
  
  horizontalTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundWhite,
    borderWidth: 1,
    borderColor: theme.colors.borderGrey,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 10,
    height: 120,
    width: 350,
    shadowColor: theme.colors.shadowGrey,
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.8, 
    shadowRadius: 6, 
    elevation: 8,
  },
  leftSection: {
    flex: 0.9,
    gap: 10,
    justifyContent: 'center',
  },
  titleText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    height: 60,
    textAlign: 'left', 
    maxWidth: '100%',
  },
  categoryText: {
    color: theme.colors.textTitleSmall,
    fontWeight: '400',
    fontSize: 12,
  },
  readTimeText: {
    color: theme.colors.textTitleLarge,
    fontSize: 11,
  },
  rightSection: {
    //backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 80, // Ensures alignment for the right section
    gap: 5,
  },
  tileSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: 40,
    height: 20,
    marginLeft: 10,
  },
  tileImage: {
    width: 70,
    height: 70,
    borderRadius: 5,
    marginBottom: 5, // Space between image and button
    resizeMode: 'cover',
  },
});

export default HomeScreen;
