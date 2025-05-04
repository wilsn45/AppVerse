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
     analytics.sendCourseListImpressionEvent()
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
    Image.prefetch(item.thumbnail); // Preload the image URL
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

const handleCardPress = (course) => {
  navigation.navigate('CourseScreen', { courseId: course.id, categoryId });
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
          <TouchableOpacity
  onPress={() => handleCardPress(item)}
  activeOpacity={0.9}
  style={styles.cardContainer}
  accessibilityLabel={`Content Card: ${item.title}`}
>
    <FastImage
      source={{ uri: item.thumbnail }}
      style={styles.topImage}
      resizeMode={FastImage.resizeMode.cover}
    />

    <View style={styles.cardContent}>
      {/* Title */}
      <Text style={styles.contentText}>{item.title}</Text>

      {/* Bottom Row: Info left, Save right */}
      <View style={styles.bottomRow}>
        <View style={styles.infoGroup}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.categoryTitle || 'Category'}</Text>
          </View>
          <Text style={styles.durationText}>{item.duration ?? '1 Hour'}</Text>
          <Text style={styles.ratingText}>⭐ {item.rating ?? '4.5'}</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleSave(item)}
          accessibilityLabel={savedCourses.get(item.id) ? `Unsave Card` : 'Save Card'}
        >
          <Ionicons
            name={savedCourses.get(item.id) ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={savedCourses.get(item.id) ? theme.colors.secondaryTheme : theme.colors.greyDark1}
          />
        </TouchableOpacity>
      </View>
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
  },
  cardContainer: {
    backgroundColor: theme.colors.white,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 16,
    overflow: 'hidden', // ensures rounded corners work with full-width image
  },
  
  topImage: {
    width: '100%',
    height: 200,
  },
  
  cardContent: {
    padding: 12,
  },
  
  contentText: {
    fontSize: 22,
    fontWeight: 'semibold',
    color: '#000',
    marginBottom: 10,
  },
  
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  infoGroup: {
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
  
  durationText: {
    fontSize: 12,
    color: '#666',
  },
  
  ratingText: {
    fontSize: 12,
    color: '#777',
  },
  
  iconButton: {
    padding: 4,
  },
  
  separatorLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
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
  levelText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 6,
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

});

export default CourseListScreen;