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
  Image,
  ScrollView
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SaveHandler } from '../../Handlers/SaveHandler.tsx';
import { OngoingCourseHandler } from '../../Handlers/OngoingCourseHandler.tsx';
import { CourseAnalytics } from '../../Analytics/CourseAnalytics.ts';
import theme from '../../Theme/Theme.js';
import { useFocusEffect } from '@react-navigation/native'; 
import { ContentHandler } from '../../Handlers/ContentHandler.tsx';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const CourseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { course } = route.params;
  const [chaptereList, setChapterList] = useState([]);
  const [isCourseSaved, setIsCourseSaved] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(true);
  const insets = useSafeAreaInsets();
  const footerHeight = 40 + insets.bottom;
  
  const analytics = new CourseAnalytics(course.id)

  useEffect(() => {
     analytics.sendCourseImpressionEvent()

     fetchChapterList()
  }, [ navigation, course]);


  const fetchChapterList = async () => {
    try {
        
        // Map the fetched documents to include doc.id and category name
        const chapterList  = await ContentHandler.fetchChapters(course.id);
       // console.log("Chapter List", chapterList)
       
        let isSaved = await SaveHandler.isCourseSaved(course.id);
        setIsCourseSaved(isSaved)
        let compltedChapters = await OngoingCourseHandler.getCompletedChapters(course.id)
        let isCourseOngoing  = await OngoingCourseHandler.isCourseOngoing(course.id)
        setIsEnrolled(isCourseOngoing)

        const updatedChapters = chapterList.map((chapter) => ({
          ...chapter,
          completed: compltedChapters.includes(chapter.id),
        }));

        setChapterList(updatedChapters)


        analytics.sendCoursePresentedEvent()
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
  }, [ navigation, course])
);

const changeCourseEnroll = async () => { 
  if (isEnrolled) {
    await OngoingCourseHandler.removeOngoingCourse(course.id)
  } else {
    console.log("Remove Ongoing")
    await OngoingCourseHandler.saveOngoingCourse(course)
  }
  setIsEnrolled(!isEnrolled)
  
};


const onChapterPress = (content) => {
  analytics.sendCourseOpenEvent()
  console.log('chapterId', content);
  navigation.navigate('ChapterScreen', { course: course, chapter: content });
};

const onToggleSave = async () => {
    const isSaved = isCourseSaved;
    
    if (isSaved) {
      await SaveHandler.removeCourse(course.id);
    } else {
     // console.log("Saving Item", content)
      await SaveHandler.saveCourse(course);
    }
    // Update only the savedCards state here
    setIsCourseSaved(!isCourseSaved)
  };
  

return (
  <View style={styles.container}>
    {/* Course Info Box */}

    <ScrollView contentContainerStyle={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
    <View style={styles.courseInfoBox}>
    <View style={styles.courseInfoContent}>
  {/* Left side (text content) takes all available space */}
  <View style={styles.courseInfoLeft}>
    <View style={styles.contentTitleView}>
    <Text style={styles.courseTitle}>{course.title}</Text>
    <Image
    source={{ uri: course.thumbnail }}
    style={styles.courseThumbnail}
    resizeMode="cover"
  />
    </View>
   
    <Text style={styles.courseDescription}>{course.description}</Text>
    <View style={styles.courseMetaRow}>
      <Text style={styles.metaText}>⭐ {course.rating ?? '4.5'}</Text>
      <Text style={styles.metaText}>⏱️ {course.duration ?? '25 Min'}</Text>
      <Text
        style={[
          styles.metaText,
          { color: course.isLiveCourse ? 'red' : theme.colors.greyDark1 },
        ]}
      >
        {course.isLiveCourse ? 'Live' : `${chaptereList.length} Chapters`}
      </Text>
      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={onToggleSave}>
        <Ionicons
          name={isCourseSaved ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={isCourseSaved ? theme.colors.secondaryTheme : theme.colors.greyDark1}
        />
      </TouchableOpacity>
    </View>
  </View>

  {/* Right side (thumbnail) fixed size */}
  
</View>
</View>

    {/* Chapter List */}
    <FlatList
        data={chaptereList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
    style={styles.chapterItem}
    onPress={() => onChapterPress(item)}
  >
    <View style={styles.chapterLeft}>
      <View style={styles.chapterTitleView}>
        <Text style={styles.chapterTitle}>{item.title}</Text>
       <Text style={styles.chapterDescription}>{item.description}</Text>
      </View>
     
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
         {item.completed  && (
          <Ionicons name="checkmark-circle" size={16} color="green" />
        )}
        <Text style={styles.chapterDuration}>{item.duration ?? '15 min'}</Text>
      </View>
    </View>
    <Image
      source={{ uri: item.thumbnail }}
      style={styles.chapterThumbnail}
      resizeMode="cover"
    />
  </TouchableOpacity>
        )}
        contentContainerStyle={styles.chapterList}
        ListEmptyComponent={
          <View style={styles.emptyDataView}>
            <Text style={styles.emptyDataLabel}>No chapters found</Text>
          </View>
        }
      />
  </ScrollView>

    {/* Footer */}
    <View style={[styles.footer, { height: footerHeight }]}>
  <TouchableOpacity
    onPress={() => changeCourseEnroll()}
    style={[
      styles.ctaButton,
      { backgroundColor: isEnrolled ? theme.colors.primaryTheme : theme.colors.secondaryTheme },
    ]}
  >
    <Text style={styles.ctaText}>
      {isEnrolled ? 'Leave' : 'Enroll'}
    </Text>
  </TouchableOpacity>
</View>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  courseInfoBox: {
    backgroundColor: theme.colors.white,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    position: 'relative', // Ensures save button positions inside this
  },
  courseInfoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start', // or 'center' if you want the image vertically centered
    padding: 4,
  },
  
  courseInfoLeft: {
    flex: 1, // This makes the text section take all available width except for the image
    paddingRight: 8, // To give space between text and image
  },
  contentTitleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  courseThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  saveButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
    width: '70%'
  },
  chapterTitleView: {
    gap: 4
  },
  courseDescription: {
    fontSize: 14,
    color: theme.colors.greyDark2,
    marginBottom: 12,
  },
  courseMetaRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.greyDark1,
  },
  chapterList: {
    paddingLeft: 16,
    paddingBottom: 100,
  },
  chapterItem: {
    flexDirection: 'row',
    backgroundColor:  theme.colors.white,
    marginBottom: 12,
    paddingLeft: 12,
    marginRight: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    height: 100,
    alignItems: 'center',
  },
  chapterLeft: {
    flex: 1,
    justifyContent: 'space-between',
   // backgroundColor: 'red',
    paddingRight: 8,
    height: 88,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: 4,
    marginTop: 4
  },
  chapterDescription: {
    fontSize: 13,
    color: theme.colors.greyDark2,
    marginBottom: 8,
    
  },
  chapterDuration: {
    fontSize: 12,
    color: theme.colors.greyDark1,
    marginTop: 4,
  },
  chapterThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginLeft: 8,
  },
  chapterStatusRow: {
    position: 'absolute',
    right: 12,
    bottom: 8,
  },
  emptyDataView: {
    padding: 20,
    alignItems: 'center',
  },
  emptyDataLabel: {
    color: theme.colors.greyDark2,
  },

  footer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginBottom: 12
  },
  
  ctaButton: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  
  ctaText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default CourseScreen;