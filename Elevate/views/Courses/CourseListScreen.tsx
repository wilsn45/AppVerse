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
import { SaveDBHandler } from '../../DBHandler/SaveDBHandler.tsx';
import { CourseListAnalytics } from '../../Analytics/CourseListAnalytics.ts';
import theme from '../../Theme/Theme.js';
import { useFocusEffect } from '@react-navigation/native'; 
import { ContentAPIClient } from '../../APIClients/ContentAPIClient.tsx';


const SCREEN_HEIGHT = Dimensions.get('window').height;

const CourseListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { topic, showTopRated, showRecommended} = route.params;
  const [courseList, setCourseList] = useState([]);
  const [savedCourses, setSavedCourses] = useState<Map<string, boolean>>(new Map());
  

  const analytics = new CourseListAnalytics()

  useEffect(() => {
     analytics.sendCourseListImpressionEvent(topic)
    fetchContentList()
  }, [ navigation, topic]);


  const fetchContentList = async () => {
    try {
        
        // Map the fetched documents to include doc.id and category name
        let coursesList = [];
        if (showTopRated) {
              coursesList = await ContentAPIClient.fetchTopRatedCourse();
          } else if (showRecommended) {
              coursesList = await ContentAPIClient.fetchRecommendedCourse();
         } else {
             coursesList = await ContentAPIClient.fetchCourseByTopic(topic);
         }
         

       // console.log("Fetched ContentList:", coursesList)
        setCourseList(coursesList)
       analytics.sendCourseListDataAppearedSuccessEvent(topic)
    } catch (error) {
      analytics.sendCourseListDataAppearedFailedEvent(topic)
      console.error('Error fetching LiveCategory:', error);
    } finally {
        
    }
};

useEffect(() => {
   if (courseList && courseList.length > 0) {
    loadCourseSaveStatus();
  }
}, [courseList]);

const loadCourseSaveStatus = async () => {
   const updatedSavedCourses = new Map();
  const checkResults = await Promise.all(
    courseList.map(async (course) => {
      const isSaved = await SaveDBHandler.isCourseSaved(course.id);
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
 // console.log('isSaved', isSaved);

  // Send analytics event
  //analytics.sendCourseSavedEvent(isSaved, course.id);

  // Perform save/remove action
  if (isSaved) {
    analytics.sendRemoveSavedCourseEvent(course.id)
    await SaveDBHandler.removeCourse(course.id);
  } else {
    analytics.sendSaveCourseEvent(course.id)
    await SaveDBHandler.saveCourse(course);
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
    let screenTitle = topic;

    if (showRecommended) {
      screenTitle = 'Recommended';
    } else if (showTopRated) {
      screenTitle = 'Top Rated';
    }

    navigation.setOptions({
      title: screenTitle,
    });
    fetchContentList()
  }, [ navigation, topic])
);


const handleCardPress = (course) => {
  analytics.sendClickOnCourseEvent(course.id)
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
          <Text
        style={[
          styles.metaText,
          { color: item.isLiveCourse ? theme.colors.red2 : theme.colors.greyDark1, fontWeight: 'bold',fontFamily: 'Roboto-Medium', },
        ]}
      >
        {item.isLiveCourse ? 'LIVE' : `${item.duration}`}
      </Text>
        <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center'}}>
          <Ionicons
                  name={'star'}
                  size={16}
                  color={theme.colors.gold}
                />
          <Text style={styles.ratingText}> {item.rating ?? '4.5'}</Text>
        </View>
    
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
    borderColor: theme.colors.greyLight2,
    borderWidth: 2,
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
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
     fontFamily: 'Roboto-Medium',
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
    backgroundColor: theme.colors.greyLight2,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  tagText: {
    fontSize: 12,
    color: theme.colors.greyDark,
     fontFamily: 'Roboto-Medium',
  },
  
  durationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Roboto-Medium',
  },
  
  ratingText: {
    fontSize: 12,
    color: '#777',
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Medium',
  },
   metaText: {
    fontSize: 13,
    color: theme.colors.greyDark1,
    fontFamily: 'Roboto-Medium',
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
    fontFamily: 'Roboto-Medium',
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