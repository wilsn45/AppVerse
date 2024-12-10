import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CategoryHandler } from '../Handlers/CategoryHandler'; // Import CategoryHandler
import ProfileHandler from '../Handlers/ProfileHandler'; 
import { AnalyticsHelper, ActionType } from '../Analytics/AnalyticsHelper';

import theme from '../Theme/Theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('User');
  const [categories, setCategories] = useState([]);
  const deviceWidth = Dimensions.get('window').width; // Get device width

  const leftPadding = 20; // Adjust these values as needed
  const rightPadding = 20;
  const spacing = 10; // Space between tiles

  // Example dynamic data for the horizontal FlatLists
  const horizontalDataArray = [
    { title: 'Popular', data: [{ id: '1', title: 'Item 1' }, { id: '2', title: 'Item 2' }] },
    { title: 'Trending', data: [{ id: '3', title: 'Item 3' }, { id: '4', title: 'Item 4' }] },
    { title: 'New Releases', data: [{ id: '5', title: 'Item 5' }, { id: '6', title: 'Item 6' }] },
    // Add more sections dynamically as needed
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        sendHomeImpressionEvent();
        const liveCategories = await CategoryHandler.getLiveCategory();
        setCategories(liveCategories);
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

  const renderHorizontalScrollList = ({ item }: { item: { id: string; title: string } }) => (
    <View style={styles.horizontalTile}>
      <Text style={styles.horizontalTileText}>{item.title}</Text>
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
    <View style={styles.container}>
      <Text
        style={styles.welcomeLabel}
        accessibilityLabel="Welcome label"
        accessibilityHint="Displays a welcome message to the user"
      >
        Welcome
      </Text>
      <Text
        style={styles.userNameLabel}
        accessibilityLabel={`${userName}`}
        accessibilityHint="Displays the logged-in user's name"
      >
        {userName}!
      </Text>
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
        accessibilityLabel="Category list"
        accessibilityHint="Lists the categories available"
      />

      {/* Render Static Horizontal List Titles */}
      {horizontalDataArray.map((section, index) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
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
    paddingBottom: 50,
    textAlign: 'left',
  },
  contentContainer: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
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
    paddingLeft: 20, // Keep the title aligned with the content
  },
  horizontalListContainer: {
    paddingVertical: 10,
  },
  horizontalTile: {
    backgroundColor: theme.colors.white,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.grey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalTileText: {
    color: theme.colors.primary,
    fontSize: 16,
  },
});

export default HomeScreen;
