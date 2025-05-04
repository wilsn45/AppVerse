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
  
  const analytics = new CourseAnalytics(categoryId,course.id)

  useEffect(() => {
     analytics.sendCourseImpressionEvent()
     //console.log("Fetched categoryId:", categoryId)

     fetchChapterList()
  }, [ navigation, course]);


  const fetchChapterList = async () => {
    try {
        
        // Map the fetched documents to include doc.id and category name
        const chapterList  = await ContentHandler.fetchChapters(course.id,categoryId);

        const filteredChapters = chapterList.filter(course => course.isLive === true);

        // console.log("Filtered Chapters", filteredChapters)
        // console.log("Fetched ContentList:", chapterList)
        const sortedData = [...filteredChapters].sort((a, b) => b.index - a.index);
        setChapterList(sortedData)
        
        let isSaved = await SaveHandler.isCourseSaved(course.id);
        setIsCourseSaved(isSaved)
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
  }, [ categoryId, navigation, course, isSaved])
);


const onChapterPress = (content) => {
  analytics.sendCourseOpenEvent()
  console.log('Pass Likes Count', content.likeCount);
  navigation.navigate('ChapterScreen', { chapterId: content.id });
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
    <View style={styles.courseInfoBox}>
      <View style={styles.courseInfoLeft}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription}>{course.description}</Text>
        <View style={styles.courseMetaRow}>
          <Text style={styles.metaText}>⭐ {course.rating ?? '4.5'}</Text>
          <Text style={styles.metaText}>⏱️ {course.duration ?? '25 Min'}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onToggleSave}>
        <Ionicons
          name={isCourseSaved ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={isCourseSaved ? theme.colors.secondaryTheme : theme.colors.greyDark1}
        />
      </TouchableOpacity>
    </View>

    {/* Chapter List */}
    <FlatList
      data={chaptereList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.chapterItem} onPress={() => onChapterPress(item)}>
          <Text style={styles.chapterTitle}>{item.title}</Text>
          <Text style={styles.chapterDescription}>{item.description}</Text>
          <View style={styles.chapterStatusRow}>
            {item.completed && (
              <Ionicons name="checkmark-circle" size={18} color="green" />
            )}
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

    {/* Footer */}
    <View style={styles.footer}>
      {/* Add your footer buttons or actions here */}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.white,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  courseInfoLeft: {
    flex: 1,
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: theme.colors.greyDark2,
    marginBottom: 8,
  },
  courseMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.greyDark1,
  },
  
  chapterList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  chapterItem: {
    backgroundColor: theme.colors.white,
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: 13,
    color: theme.colors.greyDark2,
    marginBottom: 8,
  },
  chapterStatusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default CourseScreen;