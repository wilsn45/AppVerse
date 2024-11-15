import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { categories } from '../Data/CategoryData'; // Ensure correct path to CategoryData

const HomeScreen = () => {
  const navigation = useNavigation();
  console.log('Categories:', categories);

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
  const renderTile = ({ item }: { item: { id: string; title: string } }) => (
    <TouchableOpacity onPress={() => handleTilePress(item.title, item.id)}>
      <View style={styles.tile}>
        <Text style={styles.tileText}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
    backgroundColor: '#000',
    padding: 10,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row', // Align items in a row
    marginBottom: 20, // Space between rows
    justifyContent: 'space-between', // Ensure tiles are spaced evenly
  },
  tile: {
    padding: 20,
    backgroundColor: '#333',
    margin: 10,
    borderRadius: 10,
    width: 150, // Fixed width for tiles
    height: 150, // Fixed height for tiles
    justifyContent: 'center', // Center content in the tile
    alignItems: 'center',
  },
  tileText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HomeScreen;
