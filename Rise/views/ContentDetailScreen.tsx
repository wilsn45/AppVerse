import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import theme from '../Theme/Theme';

const ContentDetailScreen = () => {
  const route = useRoute();
  const { itemTitle } = route.params;
  const { itemId } = route.params; // Access the item title passed as parameter

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{itemTitle}</Text>
      <Text style={styles.contentText}>
        {/* Detailed content for this item goes here */}
        Here’s some more detailed information about "{itemTitle}" with id "{itemId}". You can add as much text as you’d like or format it differently!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 20,
  },
  title: {
    fontSize: 26,
    color: theme.colors.black,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 18,
    color: theme.colors.grey1,
    textAlign: 'justify',
  },
});

export default ContentDetailScreen;
