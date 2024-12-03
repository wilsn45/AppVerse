import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CategoryHandler } from '../Handlers/CategoryHandler';  // Import CategoryHandler
import ProfileHandler from '../Handlers/ProfileHandler'; 
import theme from '../Theme/Theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('User');
  const [categories, setCategories] = useState([]); // State to store categories

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const liveCategories = await CategoryHandler.getLiveCategory();  // Fetch categories from CategoryHandler
        setCategories(liveCategories);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    const fetchUserName = async () => {
      try {
        const userName = await ProfileHandler.getUserName(); 
        setUserName(userName);
      } catch (error) {
        console.error("Error fetchUserName", error);
      }
    };

    fetchCategories(); // Fetch categories when component mounts
    fetchUserName(); // Fetch username when component mounts
  }, [navigation]);

  const handleTilePress = (tileType: string, id: string) => {
    // Navigate to ContentScreen with the tile type
    navigation.navigate('ContentScreen', { tileType, categoryId: id });
  };

  // Group the categories into rows of 2 tiles
  const groupCategories = () => {
    if (!categories || categories.length === 0) {
      return []; // Return empty if categories is undefined or empty
    }

    const rows = [];
    for (let i = 0; i < categories.length; i += 2) {
      rows.push(categories.slice(i, i + 2)); // Create pairs of categories
    }
    return rows;
  };

  // Render each tile in the list
  const renderTile = ({ item }: { item: { id: string; name: string } }) => (
    <TouchableOpacity onPress={() => handleTilePress(item.name, item.id)}>
      <View style={styles.tile}>
        <Text style={styles.tileText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeLabel}>Welcome</Text> {/* New Label */}
      <Text style={styles.userNameLabel}>{userName}!</Text> {/* New Label */}
      <FlatList
        data={groupCategories()} // Use the grouped categories for each row
        renderItem={({ item }) => (
          <View
            style={[
              styles.row,
              {
                justifyContent: item.length === 1 ? 'flex-start' : 'space-between', // Align left if only one tile, or space tiles if two
              },
            ]}
          >
            {item.map((category) => renderTile({ item: category }))}
          </View>
        )}
        keyExtractor={(item) => item[0].id} // Unique key for each row
        contentContainerStyle={styles.contentContainer} // Optional, for styling the content area
      />
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
    textAlign: 'left', // Center the text
  },
  userNameLabel: {
    fontSize: 20,
    color: theme.colors.black,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingBottom: 50,
    textAlign: 'left', // Center the text
  },
  contentContainer: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row', // Align items in a row
    marginBottom: 20, // Space between rows
    justifyContent: 'space-between', // Ensure tiles are spaced evenly
  },
  tile: {
    padding: 15,
    backgroundColor: theme.colors.white,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.grey2,
    width: 170, // Fixed width for tiles
    height: 150, // Fixed height for tiles
    justifyContent: 'center', // Center content in the tile
    alignItems: 'center',
  },
  tileText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
