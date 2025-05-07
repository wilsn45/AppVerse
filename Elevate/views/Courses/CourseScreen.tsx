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
  
  const analytics = new CourseAnalytics(course.id)

  useEffect(() => {
     analytics.sendCourseImpressionEvent()

     fetchChapterList()
  }, [ navigation, course]);


  const fetchChapterList = async () => {
    try {
        
        // Map the fetched documents to include doc.id and category name
        const chapterList  = await ContentHandler.fetchChapters(course.id);
        
        
        let isSaved = await SaveHandler.isCourseSaved(course.id);
        setIsCourseSaved(isSaved)
        let compltedChapters = await OngoingCourseHandler.getCompletedChapters(course.id)

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
    <View style={styles.courseInfoBox}>
  <View style={styles.courseInfoContent}>
    <View style={styles.courseInfoLeft}>
      <Text style={styles.courseTitle}>{course.title}</Text>
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
        <View style={{ flex: 1 }} /> {/* Push save icon to the end */}
      <TouchableOpacity onPress={onToggleSave}>
        <Ionicons
          name={isCourseSaved ? 'bookmark' : 'bookmark-outline'}
          size={24}
          color={isCourseSaved ? theme.colors.secondaryTheme : theme.colors.greyDark1}
        />
      </TouchableOpacity>
      </View>
    </View>

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
      <Text style={styles.chapterTitle}>{item.title}</Text>
      <Text style={styles.chapterDescription}>{item.description}</Text>
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
    justifyContent: 'space-between',
  },
  
  courseInfoLeft: {
    flex: 1,
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
    marginBottom: 8,
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
    backgroundColor: theme.colors.white,
    marginBottom: 12,
    paddingLeft: 12,
    marginRight: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    height: 102,
    alignItems: 'flex-start',
  },
  chapterLeft: {
    flex: 1,
    paddingRight: 8,
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
  footer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.white,
    padding: 10,
    borderRadius: 50,
    elevation: 3,
  },
  emptyDataView: {
    padding: 20,
    alignItems: 'center',
  },
  emptyDataLabel: {
    color: theme.colors.greyDark2,
  },
});

export default CourseScreen;