import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeHandler } from '../Handlers/HomeHandler'; 
import ProfileHandler from '../Handlers/ProfileHandler'; 
import { HomeAnalytics } from '../Analytics/HomeAnalytics';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SaveHandler } from '../Handlers/SaveHandler';
import { OngoingCourseHandler } from '../Handlers/OngoingCourseHandler';
import { ContentData, CategoryData } from '../Data/DataModel';
import { BackHandler } from 'react-native';

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
  const analytics = new HomeAnalytics();

  // Example dynamic data for the horizontal FlatLists
  const categoryData = [];
  const homeCards = [];
  let homeData = null

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true; // Prevent default back action
      };
  
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        analytics.sendHomeImpressionEvent()
        homeData = await HomeHandler.getHome();
        
        const liveCategories = homeData['Categories']

        if (!liveCategories || liveCategories.length === 0) {
          console.log("liveCategories is empty. Exiting function.");
          return; 
        }

        const sortedLiveCategories = liveCategories.sort((a, b) => a.index - b.index);
        
        setCategories(sortedLiveCategories);
        //console.log("Categories", liveCategories)

      await reloadSectionData(homeData);
       //console.log("All Home cards", homeCardsList)
       //console.log("Load All Home Crds", homeCards)

       //console.log("Load All Home Sections", newSectionDataArray)

       analytics.sendCategoryDisplayedEvent(liveCategories);
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
      //console.log("Latest Home data resp", isSuccess)
      if (isSuccess == true) {
        fetchHomeData()
        updateSavedCard()
      }
    }

    fetchHomeData();
    fetchLatestHomeData()
  }, [navigation]);

  useEffect(() => {
    
  }, [savedCards]);

  const reloadSectionData = async () => {
    const newSectionDataArray = [];
    const newSavedCards = new Map();
    console.log("Reloaded Home Page")
    const savedCourses = await SaveHandler.getSavedCourses();
    const lastFive = savedCourses.slice(-5).reverse();

    const ongoingCourses = await OngoingCourseHandler.getOngoingingCourses();
    const lastFiveOnGoingCourses = ongoingCourses.slice(-5).reverse();


      if (lastFive.length > 0) {
          homeData["Recently Saved"] = lastFive;
       }

       if (lastFiveOnGoingCourses.length > 0) {
        homeData["Continue Where you left"] = lastFiveOnGoingCourses;
     }

    // Loop over each section in homeData to organize and check saved courses
    for (const key in homeData) {
      if (key !== 'Categories') {
        const data = homeData[key];
        const sortedData = Object.values(data).sort((a, b) => a.index - b.index);
        const sectionData = { 'title': key, 'data': sortedData };

        newSectionDataArray.push(sectionData);

        // Check for saved courses in the section
        for (const item of data) {
          const isSaved = await SaveHandler.isCourseSaved(item.id);
          newSavedCards.set(item.id, isSaved); 
        }
      }
    }

    // Update the state with the section data and saved course info
    setSectionDataModel(newSectionDataArray);
    setSavedCards(newSavedCards);
  };

  useFocusEffect(
    useCallback(() => {
      reloadSectionData(); // Call your method when the screen comes into focus
    }, [])
  );


  const updateSavedCard = async () => {
    try {
      
      //console.log("Get All Home cards", homeCards)
      const newSavedCards = new Map();
      //console.log("sectionDataModel", sectionDataModel);
      if (!homeCards || homeCards.length === 0) {
        //console.log("sectionDataModel is empty. Exiting function.");
        return; 
      }
  
      for (const card of homeCards) {
        const isSaved = await SaveHandler.isCourseSaved( card.id);
         newSavedCards.set(card.id, isSaved);
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


  const handleTilePress = (item) => {
    analytics.sendCategoryClickedEvent(item.name);
    navigation.navigate('CourseListScreen', { topic: item.name });
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

  const handleSave = async (item) => {
    const isSaved = savedCards.get(item.id);
    if (isSaved) {
      await SaveHandler.removeCourse(item.id);
    } else {
      await SaveHandler.saveCourse(item);
    }
    // Update only the savedCards state here
    setSavedCards((prev) => new Map(prev).set(item.id, !isSaved));
  };

  const renderTile = ({ item }: { item: { id: string; title: string } }) => (
    <TouchableOpacity
    activeOpacity={1}
    style={[
      styles.tile,
      { width: (deviceWidth - leftPadding - rightPadding - spacing) / 2 },
    ]}
      onPress={() => handleTilePress(item)}
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

  const renderHorizontalScrollList = ({ item }) => (
    <TouchableOpacity
    activeOpacity={1}
    onPress={() =>  handleCardPress(item)}>
    <View style={styles.horizontalTile}>
      {/* Left Section: Title */}
      <View style={styles.leftSection}>
        <Text style={styles.titleText}
        numberOfLines={3} 
        ellipsizeMode="tail" 
        >{item.title}</Text>
        <View>
        <View style={styles.courseInfo}>
        <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.topic || 'Category'}</Text>
                  </View>
        <Text style={styles.readTimeText}>
            {item.isLiveCourse ? (
                <Text style={{ color: 'red' }}>LIVE</Text>
         ) : (
              item.duration
           )}
        </Text>
         <Text style={styles.ratingText}>⭐ {item.rating ?? '4.5'}</Text>
        </View>
        
        </View>
        
      </View>
  
      {/* Right Section: Image and Button */}
      <View style={styles.rightSection}>
        <Image 
          source={{ uri: item.thumbnail }} 
          style={styles.tileImage} 
        />
        

        <TouchableOpacity style={styles.tileSaveButton} onPress={() => handleSave(item)}
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

  const handleCardPress = (course) => {
    analytics.sendContentOpenEvent(course.categoryId, course.id);
    console.log("Course", course)
    navigation.navigate('CourseScreen', { course: course });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {sectionDataModel.length === 0 ? (
      <View style={styles.emptyDataView}>
        <Text style={styles.emptyDataLabel}>Hang tight... fetching new growth!!</Text>
      </View>
    ) : (
      <ScrollView contentContainerStyle={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.userNameLabel}>Hi, There!</Text>

        <Text style={styles.horizontalListTitle}>Categories</Text>
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
      </ScrollView> )}
    </SafeAreaView> 
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingVertical: 0,
    paddingHorizontal: 5,
  },
  emptyDataView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDataLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.greyLight3
  },
  container: {
    flex: 1,
  },
  welcomeLabel: {
    fontSize: 20,
    color: theme.colors.greyLight1,
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
    marginVertical: 10,
    fontWeight: '800',
    color: theme.colors.blackLight1,
    paddingLeft: 20, 
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
    borderWidth: 2,
    paddingBottom: 10,
    justifyContent: 'space-between',
    borderColor: theme.colors.greyLight2,
    height: 170,
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
    fontWeight: '800',
    color: theme.colors.blackLight1,
    paddingLeft: 20, 
    //fontFamily: 'Roboto-MediumItalic'
  },
  horizontalListContainer: {
    paddingBottom: 30,
  },
  
  horizontalTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.greyLight2,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 10,
    height: 150,
    width: 350,
  },
  leftSection: {
    flex: 0.9,
    gap: 10,
    justifyContent: 'center',
  },
  titleText: {
    color: theme.colors.blackLight1,
    fontSize: 18,
    fontWeight: '500',
    height: 80,
    textAlign: 'left', 
    maxWidth: '100%',
  },
  categoryText: {
    color: theme.colors.greyDark1,
    fontWeight: '400',
    fontSize: 12,
  },
  readTimeText: {
    color: theme.colors.greyDark2,
    fontSize: 11,
  },
  rightSection: {
   //backgroundColor: 'grey',
    justifyContent: 'space-between',
    alignItems: 'flex-end' ,
    width: 100, // Ensures alignment for the right section
    gap: 10,
    height: '100%',
  },
  tileSaveButton: {
   // backgroundColor: 'grey',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 20,
  },
  tileImage: {
    width: 100,
    height: 80,
    borderRadius: 10,
    marginBottom: 5, // Space between image and button
    resizeMode: 'contain',
  },
  ratingText: {
    fontSize: 12,
    color: '#777',
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
});

export default HomeScreen;
