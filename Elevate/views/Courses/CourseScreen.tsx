import React, { useEffect, useCallback, useState,  } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Image
} from 'react-native';
import FastImage from 'react-native-fast-image';

import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SaveHandler } from '../../Handlers/SaveHandler.tsx';
import { CourseListAnalytics } from '../../Analytics/CourseListAnalytics.ts';
import theme from '../../Theme/Theme.js';
import { useFocusEffect } from '@react-navigation/native'; 
import { ContentHandler } from '../../Handlers/ContentHandler.tsx';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const CourseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId, categoryId } = route.params;
  const [chaptereList, setChapterList] = useState([]);
  

  const analytics = new CourseListAnalytics(categoryId)

  useEffect(() => {
     //analytics.sendCourseImpressionEvent()
     //console.log("Fetched categoryId:", categoryId)

     fetchChapterList()
  }, [ , categoryId, navigation, courseId]);


  const fetchChapterList = async () => {
    try {
        
        // Map the fetched documents to include doc.id and category name
        const chapterList  = await ContentHandler.fetchChapters(courseId,categoryId);

        const filteredChapters = chapterList.filter(course => course.isLive === true);

        console.log("Filtered Chapters", filteredChapters)
        console.log("Fetched ContentList:", chapterList)
        const sortedData = [...filteredChapters].sort((a, b) => b.index - a.index);
        setChapterList(sortedData)
        analytics.sendCourseListPresentedEvent()
    } catch (error) {
        console.error('Error fetching LiveCategory:', error);
    } finally {
        
    }
};


const preloadImages = (index) => {
  const nextItems = chaptereList.slice(index, index + 10); // Prefetch the next 10 items
  nextItems.forEach(item => {
    Image.prefetch(item.thumbnail); // Preload the image URL
  });
};


const handleScroll = (event) => {
  const contentOffsetY = event.nativeEvent.contentOffset.y;
  const contentHeight = event.nativeEvent.contentSize.height;

  // If user is within the last 10% of the list, start preloading images
  if (contentHeight - contentOffsetY - SCREEN_HEIGHT < 100) {
    preloadImages(chaptereList.length - 10); // Prefetch next 10 items
  }
};


useFocusEffect(
  useCallback(() => {
    fetchChapterList()
  }, [ categoryId, navigation, courseId])
);


const handleCardPress = (content) => {
  console.log('Pass Likes Count', content.likeCount);
  //navigation.navigate('CourseScreen', { content });
};
  


  return (
    <View style={styles.container}>
      <FlatList
        data={chaptereList}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        onEndReachedThreshold={0.1}
        onScroll={handleScroll}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
          <View style={styles.separatorLine} />
        
          <TouchableOpacity
            onPress={() => handleCardPress(item)}
            activeOpacity={1}
            style={styles.cardContent}
            accessibilityLabel={`Content Card: ${item.title}`}
          >
            {/* LEFT SIDE: Title, Description, Category, etc. */}
            <View style={styles.leftContent}>
              <View style={styles.topLeft}>
                <Text style={styles.contentText}>{item.title}</Text>
                <Text style={styles.contentDescription} accessibilityLabel={item.description}>
                  {item.description}
                </Text>
              </View>
          
            </View>
        
            {/* RIGHT SIDE: Image + Duration + Save */}
            <View style={styles.rightContent}>
              <FastImage
                source={{ uri: item.thumbnail }}
                style={styles.tileImage}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>
          </TouchableOpacity>
        </View>
        )}
      />

 </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  cardContainer: {
    backgroundColor: theme.colors.white,
    padding: 12,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  leftContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  topLeft: {
    flexShrink: 1,
    gap: 10
  },
  contentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 15,
  },
  
  rightContent: {
    width: '25%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  tileImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  imageBottomRow: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  iconButton: {
    padding: 4,
    marginBottom: 2, // optional
  },
});

export default CourseScreen;