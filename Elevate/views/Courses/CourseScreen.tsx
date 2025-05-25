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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SaveHandler } from '../../Handlers/SaveHandler.tsx';
import { OngoingCourseHandler } from '../../Handlers/OngoingCourseHandler.tsx';
import { CourseAnalytics } from '../../Analytics/CourseAnalytics.ts';
import theme from '../../Theme/Theme.js';
import { useFocusEffect } from '@react-navigation/native'; 
import { ContentHandler } from '../../Handlers/ContentHandler.tsx';
import { CompletedCourseHandler } from '../../Handlers/CompletedCourseHandler.tsx';


const CourseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { course } = route.params;
  const [chaptereList, setChapterList] = useState([]);
  const [isCourseSaved, setIsCourseSaved] = useState(false);
  const [isOngoingCourse, setIsOngoingCourse] = useState(null);
  const [isCourseCompleted, setIsCourseCompleted] = useState(null);
  const insets = useSafeAreaInsets();
  const footerHeight = 70 + insets.bottom;
  
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
        let isCourseCompleted = await CompletedCourseHandler.isCourseCompleted(course.id)
        setIsCourseCompleted(isCourseCompleted)
        setIsOngoingCourse(isCourseOngoing)
        
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


useFocusEffect(
  useCallback(() => {
    fetchChapterList()
  }, [ navigation, course])
);

const changeCourseEnroll = async () => { 
  if (isOngoingCourse) {
    await OngoingCourseHandler.removeOngoingCourse(course.id)
  } else {
    await CompletedCourseHandler.removeCompletedCourse(course.id)
    await OngoingCourseHandler.saveOngoingCourse(course)
    let firstChapter = chaptereList[0]
    await onChapterPress(firstChapter)
  }
  setIsOngoingCourse(!isOngoingCourse)
  
};


const onChapterPress = async (content) => {
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
      <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center'}}>
          <Ionicons
                  name={'star'}
                  size={16}
                  color={theme.colors.gold}
                />
          <Text style={styles.metaText}> {course.rating ?? '4.5'}</Text>
        </View>
      <View style={styles.tag}>
            <Text style={styles.tagText}>{course.topic}</Text>
        </View>
      <Text style={styles.metaText}>⏱️ {course.duration ?? '25 Min'}</Text>
      <Text
        style={[
          styles.metaText,
          { color: course.isLiveCourse ? theme.colors.red2 : theme.colors.greyDark1, fontWeight: 'bold' },
        ]}
      >
        {course.isLiveCourse ? 'LIVE' : `${chaptereList.length} Chapters`}
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

     
        <Text style={styles.chapterTitle}>{item.title}</Text>
       <Text style={styles.chapterDescription}>{item.description}</Text>
     
     
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
         {item.completed  && (
          <Ionicons name="checkmark-done-outline" size={16} color={theme.colors.secondaryTheme} />
        )}
        <Text style={styles.chapterDuration}>{item.duration ?? '15 min'}</Text>
      </View>

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
    {(typeof isOngoingCourse === 'boolean' || typeof isCourseCompleted === 'boolean') && (
  <View style={[styles.footer, { height: footerHeight }]}>
    <TouchableOpacity
      onPress={() => changeCourseEnroll()}
      disabled={isCourseCompleted === true}
      style={[
        styles.ctaButton,
        {
          backgroundColor: isCourseCompleted
            ? theme.colors.secondaryThemeDisabled 
            : isOngoingCourse
            ? theme.colors.primaryTheme
            : theme.colors.secondaryTheme,
        },
      ]}
    >
      <Text style={styles.ctaText}>
        {isCourseCompleted
          ? 'Completed'
          : isOngoingCourse
          ? 'Leave'
          : 'Start Course'}
      </Text>
    </TouchableOpacity>
  </View>
)}
    
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
    padding: 8,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.greyLight2,
  },
  courseInfoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start', // or 'center' if you want the image vertically centered
    padding: 4,
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
  },
  
  courseInfoLeft: {
    flex: 1, // This makes the text section take all available width except for the image
    paddingRight: 8, // To give space between text and image
  },
  contentTitleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16
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
  courseDescription: {
    fontSize: 16,
    color: theme.colors.greyDark2,
    marginBottom: 20,
    marginTop: 12,
    lineHeight: 20,
    fontWeight: '400',
  },
  courseMetaRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.greyDark1,
  },
  chapterList: {
    paddingBottom: 100,
    paddingTop: 16
  },
  chapterItem: {
    backgroundColor:  theme.colors.white,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.greyLight2,
    alignItems: 'flex-start',
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: 12,
    marginTop: 4,
  },
  chapterDescription: {
    fontSize: 14,
    color: theme.colors.greyDark2,
    marginBottom: 8,
    fontWeight: '400',
    lineHeight: 18
   // fontFamily: 'Courier'
    
  },
  chapterDuration: {
    fontSize: 12,
    color: theme.colors.greyDark1,
    marginTop: 4,
    marginBottom: 4
  },
  chapterThumbnail: {
    width: 100,
    height: '90%',
    maxHeight: 125,
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
    backgroundColor: theme.colors.backgroundWhite,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 2,
    borderColor: theme.colors.greyLight2,
    paddingVertical: 8,
  },
  
  ctaButton: {
    width: '100%',
    height: 45,
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