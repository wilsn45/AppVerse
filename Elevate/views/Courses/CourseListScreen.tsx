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
  const { topic} = route.params;
  const [courseList, setCourseList] = useState([]);
  const [savedCourses, setSavedCourses] = useState<Map<string, boolean>>(new Map());
  

  const analytics = new CourseListAnalytics(topic)

  useEffect(() => {
     analytics.sendCourseListImpressionEvent()
    fetchContentList()
  }, [ navigation, topic]);


  const fetchContentList = async () => {
    try {
        
        // Map the fetched documents to include doc.id and category name
        const coursesList  = await ContentHandler.fetchCourseByTopic(topic);

       // console.log("Fetched ContentList:", coursesList)
        setCourseList(coursesList)
        analytics.sendCourseListPresentedEvent()
    } catch (error) {
        console.error('Error fetching LiveCategory:', error);
    } finally {
        
    }
};

useEffect(() => {
  if (courseList.length > 0) {
    loadCourseSaveStatus();
  }
}, [courseList]);

const loadCourseSaveStatus = async () => {
   const updatedSavedCourses = new Map();
  const checkResults = await Promise.all(
    courseList.map(async (course) => {
      const isSaved = await SaveHandler.isCourseSaved(course.id);
      return { id: course.id, isSaved };
    })
  );

  checkResults.forEach(({ id, isSaved }) => {
    updatedSavedCourses.set(id, isSaved);
  });
  setSavedCourses(updatedSavedCourses);
  
};

const handleSave = async (course) => {
  const isSaved = savedCourses.get(course.id);
  console.log('isSaved', isSaved);

  // Send analytics event
  analytics.sendCourseSavedEvent(isSaved, course.id);

  // Perform save/remove action
  if (isSaved) {
    await SaveHandler.removeCourse(course.id);
  } else {
    await SaveHandler.saveCourse(course);
  }

  // Update the savedCourses state
  setSavedCourses(prevMap => {
    const newMap = new Map(prevMap); // Create a shallow copy to trigger re-render
    const currentValue = newMap.get(course.id) || false;
    newMap.set(course.id, !currentValue); // Toggle the value
     return newMap;
  });
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
      title: topic,
    });
    fetchContentList()
  }, [ navigation, topic])
);


const handleCardPress = (course) => {
  navigation.navigate('CourseScreen', { course: course });
};
  



// useEffect(() => {
//   console.log('Saved courses updated (from useEffect):', savedCourses);
// }, [savedCourses]);
  

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
            <Text style={styles.tagText}>{item.topic || 'Category'}</Text>
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