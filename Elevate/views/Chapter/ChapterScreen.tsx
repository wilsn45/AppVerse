import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ChapterAnalytics } from '../../Analytics/ChapterAnalytics';
import theme from '../../Theme/Theme';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ContentHandler } from '../../Handlers/ContentHandler';
import { OngoingCourseHandler } from '../../Handlers/OngoingCourseHandler.tsx';
import { CompletedCourseHandler } from '../../Handlers/CompletedCourseHandler.tsx';

const ChapterScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { course,chapter } = route.params;
  const [htmlContent, setHtmlContent] = useState('');
  const [markedRead, setMarkedRead] = useState(false);

  const analytics = new ChapterAnalytics(chapter.id);

  useEffect(() => {
    analytics.sendChapterImpressionEvent();

    const fetchContent = async () => {
      const doc = await ContentHandler.fetchChapter(chapter.id);
      setHtmlContent(doc?.htmlContent || '');
    };

    fetchContent();
  }, [chapter]);

  const injectedJS = `
    window.onscroll = function() {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
        window.ReactNativeWebView.postMessage("scrollEnd");
      }
    };
    true;
  `;

  const handleWebViewMessage = (event) => {
    if (event.nativeEvent.data === 'scrollEnd' && !markedRead) {
     // analytics.markChapterAsRead?.();      
      setMarkedRead(true);
      console.log("course", course)
      console.log("chapter", chapter)
      if (chapter.isLastChapter === true && !course.isLiveCourse) {
        console.log("Mark Course Completed")
        OngoingCourseHandler.removeOngoingCourse(course.id)
        OngoingCourseHandler.saveChapter(course.id,chapter.id)
        CompletedCourseHandler.completeCourse(course)
      } else {
        console.log("Save Course Progress")
        OngoingCourseHandler.saveChapter(course.id,chapter.id)
        OngoingCourseHandler.saveOngoingCourse(course)
      }
     
    }
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
      <View style={styles.footer}>
        {/* Add footer buttons if needed */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: 80,
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
    color: theme.colors.grey1,
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.greyLight2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
  },
  footerButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChapterScreen;
