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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SaveHandler } from '../../Handlers/SaveHandler.tsx';
import { CourseListAnalytics } from '../../Analytics/CourseListAnalytics.ts';
import theme from '../../Theme/Theme.js';
import { useFocusEffect } from '@react-navigation/native'; 
import { ContentHandler } from '../../Handlers/ContentHandler.tsx';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const ChapterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryTitle, categoryId } = route.params;
  const [courseList, setCourseList] = useState([]);
  const [savedCourses, setSavedCourses] = useState<Map<string, boolean>>(new Map());
  

  const analytics = new CourseListAnalytics(categoryId)

  useEffect(() => {
     analytics.sendCourseImpressionEvent()
     //console.log("Fetched categoryId:", categoryId)

    fetchContentList()
  }, [ , categoryId, navigation, categoryTitle]);


  const fetchContentList = async () => {
    try {
        
        // Map the fetched documents to include doc.id and category name
        const coursesList  = await ContentHandler.fetchCourseByCategory(categoryId);

        const filteredCourses = coursesList.filter(course => course.isLive === true);

        console.log("Filtered Cards", filteredCourses)
        console.log("Fetched ContentList:", coursesList)
        const sortedData = [...filteredCourses].sort((a, b) => b.index - a.index);
        setCourseList(sortedData)
        analytics.sendCourseListPresentedEvent()
    } catch (error) {
        console.error('Error fetching LiveCategory:', error);
    } finally {
        
    }
};

const loadCards = async () => {
  //console.log('Fetched list 2', contentList);
  
  const savedContentIds = await SaveHandler.getSavedCardByCategory(categoryId) || [];
  //console.log("savedContentIds", savedContentIds)
  //console.log("likedContentIds", likedContentIds)

  const updatedSavedCourses = new Map();

  //console.log('Updated Liked: contentList  Count', contentList);

  //console.log("contentList length:", contentList.length);

  courseList.forEach((item) => {
    updatedSavedCourses.set(item.id, savedContentIds.some((savedCourses) => savedCard.id === item.id));
  });

  setSavedCourses(updatedSavedCourses);
 // console.log('updatedSavedCards', updatedSavedCards);
};

const preloadImages = (index) => {
  const nextItems = courseList.slice(index, index + 10); // Prefetch the next 10 items
  nextItems.forEach(item => {
    Image.prefetch(item.thumbnailMax); // Preload the image URL
  });
};


const handleScroll = (event) => {
  const contentOffsetY = event.nativeEvent.contentOffset.y;
  const contentHeight = event.nativeEvent.contentSize.height;

  // If user is within the last 10% of the list, start preloading images
  if (contentHeight - contentOffsetY - SCREEN_HEIGHT < 100) {
    preloadImages(courseList.length - 10); // Prefetch next 10 items
  }
};


useFocusEffect(
  useCallback(() => {
    navigation.setOptions({
      title: categoryTitle,
    });
    fetchContentList()
  }, [ categoryId, navigation, categoryTitle])
);

useFocusEffect(
  useCallback(() => {
    navigation.setOptions({
      title: categoryTitle,
    });
    //console.log('LoadCard: Fetched list', contentList);
    if (courseList.length > 0) {
        loadCards();
    }
  }, [ courseList])
);

const handleCardPress = (content) => {
  console.log('Pass Likes Count', content.likeCount);
  navigation.navigate('CourseScreen', { content });
};
  

  const handleSave = async (course) => {
    const isSaved = savedCourses.get(course.id);
    analytics.sendCourseSavedEvent(isSaved, course.id)
    if (isSaved) {
      await SaveHandler.removeSave(categoryId, course.id);
    } else {
     // console.log("Saving Item", content)
      await SaveHandler.addSave(course);
    }
    // Update only the savedCards state here
    setSavedCourses((prev) => new Map(prev).set(course.id, !isSaved));
  };
  
  

  return (
    <View style={styles.container}>
      <FlatList
        data={courseList}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        onEndReachedThreshold={0.1}
        onScroll={handleScroll}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <TouchableOpacity onPress={() => handleCardPress(item)} style={styles.cardContent}
            activeOpacity={1}
               accessibilityLabel={`Content Card: ${item.title}`}>
                <FastImage 
                    source={{ uri: item.thumbnailMax }} 
                     style={styles.tileImage} 
                     resizeMode={FastImage.resizeMode.cover}
                  />
               <View>
                <Text style={styles.contentText}>{item.title}</Text>
                <Text style={styles.contentDescription}  accessibilityLabel={item.description} >{item.description}</Text>
              </View>
             
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleSave(item)}
                accessibilityLabel={savedCourses.get(item.id) ?`Unsave Card`: 'Save Card'}>
                <Ionicons
                  name={savedCourses.get(item.id) ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={savedCourses.get(item.id) ? theme.colors.secondaryTheme : theme.colors.greyDark1}
                />
              </TouchableOpacity>
            </View>
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
    flex: 1,
    height: SCREEN_HEIGHT,
    backgroundColor: theme.colors.white,
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 15,
    paddingBottom: 90
  },
  cardContent: {
    height: '80%',
    justifyContent: 'flex-start',
    gap: 20,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 80,
  },
  contentText: {
    fontSize: 24,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '500'
  },
  contentDescription:  {
    fontSize: 18,
    color: theme.colors.greyText,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 30
  },
  iconButton: {
    padding: 10,
  },
  tileImage: {
    width: '90%',
    height: 300,
    borderRadius: 10,
    marginTop: 25,
    marginBottom: 5, // Space between image and button
    resizeMode: 'cover',
  },
});

export default ChapterScreen;