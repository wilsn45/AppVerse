import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ChapterAnalytics } from '../../Analytics/ChapterAnalytics';
import theme from '../../Theme/Theme';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ContentHandler } from '../../Handlers/ContentHandler';
import { OngoingCourseHandler } from '../../Handlers/OngoingCourseHandler.tsx';
import { CompletedCourseHandler } from '../../Handlers/CompletedCourseHandler.tsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChapterScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { course,chapter } = route.params;
  const [htmlContent, setHtmlContent] = useState('');
  const [markedRead, setMarkedRead] = useState(false);
  const [nextChapter, setNextChapter] = useState(null);
  const [prevChapter, setPrevChapter] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(chapter);

  const analytics = new ChapterAnalytics(chapter.id);
  const insets = useSafeAreaInsets();
  const footerHeight = 70 + insets.bottom;
  const [chapterDataLoaded, setChapterDataLoaded] = useState(false);
  const [isOngoingCourse, setIsOngoingCourse] = useState(false);
  const [isCourseCompleted, setisCourseCompleted] = useState(false);
  

  useEffect(() => {
    analytics.sendChapterImpressionEvent();

    const fetchContent = async () => {
      setChapterDataLoaded(false);
      const doc = await ContentHandler.fetchChapter(currentChapter.id);
      setHtmlContent(doc?.htmlContent || '');

      console.log("current chapter", currentChapter)

      const nextChapter = await ContentHandler.fetchNextChapter(course.id, currentChapter.id)
      setNextChapter(nextChapter)
      console.log("next chapter", nextChapter)

      const prevChapter = await ContentHandler.fetchPrevChapter(course.id, currentChapter.id)
      setPrevChapter(prevChapter)
      console.log("Prev chapter", prevChapter)

      let isCourseOngoing  = await OngoingCourseHandler.isCourseOngoing(course.id)
      setIsOngoingCourse(isCourseOngoing)

      let isCourseCompleted  = await CompletedCourseHandler.isCourseCompleted(course.id)
      setisCourseCompleted(isCourseCompleted)

      setChapterDataLoaded(true);

    };

    fetchContent();
  }, [currentChapter]);

  const injectedJS = `
    window.onscroll = function() {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
        window.ReactNativeWebView.postMessage("scrollEnd");
      }
    };
    true;
  `;

  const handleWebViewMessage = (event) => {
    // if (event.nativeEvent.data === 'scrollEnd' && !markedRead) {
    //  // analytics.markChapterAsRead?.();      
    //   setMarkedRead(true);
    //   console.log("course", course)
    //   console.log("chapter", chapter)
    //   if (chapter.isLastChapter === true && !course.isLiveCourse) {
    //     console.log("Mark Course Completed")
    //     OngoingCourseHandler.removeOngoingCourse(course.id)
    //     OngoingCourseHandler.saveChapter(course.id,chapter.id)
    //     CompletedCourseHandler.completeCourse(course)
    //   } else {
    //     console.log("Save Course Progress")
    //     OngoingCourseHandler.saveChapter(course.id,chapter.id)
    //   }
     
    // }
  };

  const onStartCourse = async() => {
    console.log('Start Course pressed');
    await OngoingCourseHandler.removeOngoingCourse(course.id)
  };
  
  const onNext = () => {
    if (nextChapter) {
      OngoingCourseHandler.saveChapter(course.id,currentChapter.id)
      setCurrentChapter(nextChapter); // Trigger re-render with new data
    }
  };
  
  const onPrev = () => {
    if (prevChapter) {
      setCurrentChapter(prevChapter);
    }
  };
  
  const onComplete = () => {
    console.log('Completed pressed');
    OngoingCourseHandler.removeOngoingCourse(course.id)
    CompletedCourseHandler.completeCourse(course)
    OngoingCourseHandler.saveChapter(course.id,currentChapter.id)
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {htmlContent ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webView}
            injectedJavaScript={injectedJS}
            onMessage={handleWebViewMessage}
          />
        ) : (
          <View style={styles.emptyDataView}>
            <Text style={styles.emptyDataLabel}>Loading...</Text>
          </View>
        )}
      </View>

      {/* Footer Section */}
      {currentChapter  && (
  <View style={[styles.footer, { height: footerHeight }]}>
    <View style={styles.buttonContainer}>

      {/* LEFT CTA */}
      {currentChapter.isFirstChapter ? (
        !isOngoingCourse  && chapterDataLoaded ? (
          <TouchableOpacity
            style={[styles.button, styles.startCourseButton]}
            onPress={onStartCourse}
          >
            <Text style={styles.buttonText}>Start Course</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.button, styles.startCourseButton, { opacity: 0 }]} />
        )
      ) : prevChapter ? (
        <TouchableOpacity style={styles.iconButton} onPress={onPrev}>
          <Ionicons name="arrow-back-outline" size={32} color={theme.colors.greyDark} />
        </TouchableOpacity>
      ) : (
        <View style={[styles.iconButton, { width: 48, opacity: 0 }]} />
      )}

      {/* RIGHT CTA */}
      {currentChapter.isLastChapter ? (
        !(isCourseCompleted || course.isLiveCourse) ? (
          <TouchableOpacity
            style={[styles.button, styles.completeCourseButton]}
            onPress={onComplete}
          >
            <Text style={styles.buttonText}>Completed</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.button, styles.startCourseButton, { opacity: 0 }]} />
        )
      ) : nextChapter ? (
        <TouchableOpacity style={styles.iconButton} onPress={onNext}>
          <Ionicons name="arrow-forward-outline" size={32} color={theme.colors.greyDark} />
        </TouchableOpacity>
      ) : (
        <View style={[styles.iconButton, { width: 48, opacity: 0 }]} />
      )}
    </View>
  </View>
)}
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainContent: {
    flex: 1,
  },
  webView: {
    flex: 1,
    marginVertical: 0,
    borderRadius: 2,
  },
  emptyDataView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDataLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.greyLight3,
  },
  title: {
    fontSize: 26,
    color: theme.colors.black,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 18,
    color: theme.colors.greyDark1,
    textAlign: 'justify',
  },

  footer: {
    paddingHorizontal: 8,
    borderTopWidth: 2,
    borderColor: theme.colors.greyLight2,
    backgroundColor:  theme.colors.backgroundWhite,
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  startCourseButton: {
    backgroundColor: theme.colors.secondaryTheme,
  },
  completeCourseButton: {
    backgroundColor: theme.colors.primaryTheme,
  },
  greyButton: {
    backgroundColor: theme.colors.greyDark,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 16
  },
  iconButton: {
    width: 84,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
});

export default ChapterScreen;
