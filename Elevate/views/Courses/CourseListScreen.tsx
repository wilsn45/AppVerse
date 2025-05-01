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

const CourseListScreen = () => {
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
          <TouchableOpacity
            onPress={() => handleCardPress(item)}
            activeOpacity={1}
            style={styles.cardContent}
            accessibilityLabel={`Content Card: ${item.title}`}
          >
            {/* LEFT SIDE: Textual Info */}
            <View style={styles.leftContent}>
              <Text style={styles.contentText}>{item.title}</Text>
              <Text style={styles.contentDescription} accessibilityLabel={item.description}>
                {item.description}
              </Text>
              <View style={styles.bottomRow}>
              <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.categoryTitle || 'Category'}</Text>
                </View>
              <Text style={styles.ratingText}>⭐ {item.rating ?? '4.5'}</Text>
               <Text style={styles.levelText}>{item.duration ?? '1 Hour'}</Text>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => handleSave(item)}
                  accessibilityLabel={savedCourses.get(item.id) ? `Unsave Card` : 'Save Card'}
                >
                  <Ionicons
                    name={savedCourses.get(item.id) ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={savedCourses.get(item.id) ? theme.colors.secondaryTheme : theme.colors.greyDark1}
                  />
                </TouchableOpacity>
              </View>
            </View>
      
            {/* RIGHT SIDE: Image */}
            <FastImage
              source={{ uri: item.thumbnailMax }}
              style={styles.tileImage}
              resizeMode={FastImage.resizeMode.cover}
            />
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
    backgroundColor: '#fff',
  },
  cardContainer: {
    height: 180,
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  leftContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  contentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: 4,
  },
  contentDescription: {
    fontSize: 14,
    color: theme.colors.greyDark1,
    flexShrink: 1,
  },
  bottomRow: {
    flexDirection: 'row',
     justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 5
  },
  tag: {
    backgroundColor: theme.colors.secondaryTheme,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: 'white',
  },
  iconButton: {
    padding: 4,
  },
  tileImage: {
    width: 150,
    height: '100%',
  },
  textContent: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'space-between',
  },
  
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  
  ratingText: {
    fontSize: 12,
    color: theme.colors.greyDark1,
  },
  
  levelText: {
    fontSize: 12,
    color: theme.colors.greyDark1,
  },
  
  categoryTag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: theme.colors.greyLight1,
    borderRadius: 12,
    color: theme.colors.black,
  },
});

export default CourseListScreen;