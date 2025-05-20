import React, { useEffect, useCallback, useState,  } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import FastImage from 'react-native-fast-image';

import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TopicAnalytics } from '../../Analytics/TopicAnalytics.ts';
import theme from '../../Theme/Theme.js';
import { useFocusEffect } from '@react-navigation/native'; 
import { ContentHandler } from '../../Handlers/ContentHandler.tsx';


const SCREEN_HEIGHT = Dimensions.get('window').height;

const TopicsScreen = () => {
  const navigation = useNavigation();
  const [topicList, setTopicList] = useState([]);
  
  const analytics = new TopicAnalytics()

  useEffect(() => {
     analytics.sendTopicListImpressionEvent()
    fetchContentList()
  }, [ navigation]);


  const fetchContentList = async () => {
    try {
        
        // Map the fetched documents to include doc.id and category name
        const topicList  = await ContentHandler.fetchTopics();

        console.log("Fetched topicList:", topicList)
        setTopicList(topicList)
        analytics.sendTopicListPresentedEvent()
    } catch (error) {
        console.error('Error fetching LiveCategory:', error);
    } 
};


 const handleTilePress = (item) => {
    analytics.sendTopicClickedEvent(item.title)
    navigation.navigate('CourseListScreen', { topic: item.title });
 };


  return (
    <View style={styles.container}>
      <FlatList
        data={topicList}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleTilePress(item)}
            accessibilityLabel={`Topic Title ${item.title}`}
        >
             <View style={styles.itemContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                
            </View>
         </TouchableOpacity>
        )}
      />

 </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingTop: 24
  },
   itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    paddingLeft: 12,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.backgroundWhite,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.greyLight2,
    marginBottom: 12
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginVertical: 8
  },
  title: {
    fontSize: 18,
     color: theme.colors.black,
     fontWeight: '500'
  },
  separator: {
    height: 12,
  },
  

});

export default TopicsScreen;