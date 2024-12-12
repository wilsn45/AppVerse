import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeHandler } from '../Handlers/HomeHandler'; // Import CategoryHandler
import ProfileHandler from '../Handlers/ProfileHandler'; 
import { AnalyticsHelper, ActionType } from '../Analytics/AnalyticsHelper';
import { SafeAreaView } from 'react-native-safe-area-context';

import theme from '../Theme/Theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('User');
  const [categories, setCategories] = useState([]);
  const [sectionDataModel, setSectionDataModel] = useState([]);
  const deviceWidth = Dimensions.get('window').width; // Get device width

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
        
        setCategories(homeData['Categories']);
        //console.log("Categories", liveCategories)


        const sectionDataArray = [];
        for (const key in homeData) {
          if (key !== 'Categories') {
              const sectionData = {'title': key, 'data': homeData[key] }
              sectionDataArray.push(sectionData)
          }
       }

       console.log('SectionDataArray', sectionDataArray)
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

    fetchCategories();
    fetchUserName();
  }, [navigation]);

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

  const renderTile = ({ item }: { item: { id: string; title: string } }) => (
    <TouchableOpacity
      onPress={() => handleTilePress(item.name, item.id)}
      accessibilityLabel={`Category tile for ${item.name}`}
      accessibilityHint="Tap to view the content in this category"
      accessibilityRole="button"
    >
      <View
        style={[
          styles.tile,
          { width: (deviceWidth - leftPadding - rightPadding - spacing) / 2 },
        ]}
        accessible
        accessibilityLabel={`Tile: ${item.name}`}
      >
        <Text style={styles.tileText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHorizontalScrollList = ({ item }: { item: { id: string; title: string, imageUrl: string, category: string } }) => (
    <View style={styles.horizontalTile}>
      {/* Left Section: Title */}
      <View style={styles.leftSection}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
  
      {/* Right Section: Image and Button */}
      <View style={styles.rightSection}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.tileImage} 
        />
         {/* <TouchableOpacity style={styles.saveButton}> 
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeLabel}>Welcome</Text>
        <Text style={styles.userNameLabel}>{userName}!</Text>

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
    backgroundColor: theme.colors.background, // Ensures safe area is styled
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
    paddingBottom: 20,
    textAlign: 'left',
  },
  categoryLabel: {
    fontSize: 20,
    color: theme.colors.black,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingBottom: 10,
    textAlign: 'left',
  },
  contentContainer: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tile: {
    padding: 15,
    backgroundColor: theme.colors.white,
    margin: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.grey2,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  horizontalListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: theme.colors.black,
    paddingLeft: 20, 
  },
  horizontalListContainer: {
    paddingBottom: 20,
  },
  


  horizontalTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.grey2,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    height: 100,
    width: 300,
  },
  leftSection: {
    flex: 0.9,
    justifyContent: 'center',
  },
  titleText: {
    color: theme.colors.black,
    fontSize: 14,
    fontWeight: 'bold',
    height: 60,
    marginBottom: 5, // Space between title and category
  },
  categoryText: {
    color: theme.colors.grey1,
    fontSize: 10,
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60, // Ensures alignment for the right section
  },
  tileImage: {
    width: 70,
    height: 50,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 5, // Space between image and button
    resizeMode: 'cover',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: 5,
    marginTop: 5,
    paddingHorizontal: 10,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 10,
    textAlign: 'center',
  },
});

export default HomeScreen;
