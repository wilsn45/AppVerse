import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator // Import ActivityIndicator for a spinner
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ChapterAnalytics } from '../../Analytics/ChapterAnalytics';
import theme from '../../Theme/Theme';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ContentAPIClient } from '../../APIClients/ContentAPIClient.tsx';
import UserReferrerAPI  from '../../APIClients/UserReferrerAPI.tsx';
import AdMobAPIClient  from '../../APIClients/AdMobAPIClient.tsx';
import { OngoingCourseDBHandler } from '../../DBHandler/OngoingCourseDBHandler.tsx';
import { AdMobDBHandler } from '../../DBHandler/AdMobDBHandler.tsx';
import { CompletedCourseDBHandler } from '../../DBHandler/CompletedCourseDBHandler.tsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AudioPlayer from './AudioPlayer';


const ChapterScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { course,chapterList, index } = route.params;
  const [htmlContent, setHtmlContent] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [markedRead, setMarkedRead] = useState(false);
  const [nextChapter, setNextChapter] = useState(null);
  const [prevChapter, setPrevChapter] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(chapterList[index]);
  const [currentIndex, setCurrentIndex] = useState(index);


  const analytics = new ChapterAnalytics();
  const insets = useSafeAreaInsets();
  const footerHeight = 70 + insets.bottom;
  const [chapterDataLoaded, setChapterDataLoaded] = useState(false);
  const [isOngoingCourse, setIsOngoingCourse] = useState(false);
  const [isCourseCompleted, setisCourseCompleted] = useState(false);

  const [selectedMode, setSelectedMode] = useState('read'); // 'read' or 'listen'

  const onModeChange = (mode) => {
    if (selectedMode !== mode) {
      setSelectedMode(mode);
     // console.log('Mode changed to:', mode);
      // Call your callback function here
      // handleModeChange(mode);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: () => (

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedMode === 'read' && styles.selectedToggleButton,
            ]}
            onPress={() => onModeChange('read')}
          >
            <Text
              style={[
                styles.toggleText,
                selectedMode === 'read' && styles.selectedToggleText,
              ]}
            >
              Read
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedMode === 'listen' && styles.selectedToggleButton,
            ]}
            onPress={() => onModeChange('listen')}
            accessibilityLabel="Toggle Audio Mode"
          >
            <Ionicons
              name="headset-outline"
              size={20}
              color={
                selectedMode === 'listen'
                  ? theme.colors.white
                  : theme.colors.greyDark
              }
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, selectedMode]);


  useEffect(() => {
    try {
    analytics.sendChapterImpressionEvent(currentChapter.id);

    const fetchContent = async () => {

      setChapterDataLoaded(false); // Set to false at the start of fetch
      const doc = await ContentAPIClient.fetchChapter(course.id, currentChapter.id);
      setHtmlContent(doc?.htmlContent || '');
      setAudioUrl(doc?.audioUrl || '');
      console.log("audioUrl", doc?.audioUrl)
      analytics.sendChapterDataAppearedSuccessEvent(currentChapter.id)

      //console.log("current chapter", currentChapter)

      const index = chapterList.findIndex(ch => ch.id === currentChapter.id);

      setPrevAndNextChapters(index)


      let isCourseOngoing  = await OngoingCourseDBHandler.isCourseOngoing(course.id)
      setIsOngoingCourse(isCourseOngoing)
      console.log("isOngoingCourse", isOngoingCourse)

      let isCourseCompleted  = await CompletedCourseDBHandler.isCourseCompleted(course.id)
      setisCourseCompleted(isCourseCompleted)

      setChapterDataLoaded(true); // Set to true after data is loaded
      const shouldShowAd =  await AdMobDBHandler.showInterstitialAds();

     if (shouldShowAd) {
       // console.log('Show Ads');

     try {
         console.log('Show Ads');
         await AdMobAPIClient.showInterstitialAd();
          await UserReferrerAPI.addAdImpression(course.id, currentChapter.id);
        console.log('Ad closed, continue app flow');
     } catch (error) {
           console.error('Ad failed or was not shown:', error);
     }
  }

    };

    fetchContent();

     } catch (error) {
        analytics.sendChapterDataAppearedFailedEvent(currentChapter.id)
        console.error('Error fetching Chapter:', error);
    } finally {
        // Ensure chapterDataLoaded is set to true even if there's an error,
        // or handle error state display separately if needed.
        // For now, we'll keep it as is, assuming fetchContent handles errors.
    }
  }, [currentChapter]);


  const setPrevAndNextChapters = (index) => {
     //console.log("chapterList", chapterList)
   // console.log("index", index)
    const prevChapter = index > 0 ? chapterList[index - 1] : null;
    const nextChapter = index < chapterList.length - 1 ? chapterList[index + 1] : null;
    setNextChapter(nextChapter);
    setPrevChapter(prevChapter);
    setCurrentIndex(index);

   // console.log("next chapter", nextChapter)
    //console.log("prev chapter", prevChapter)
  };

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
    //     OngoingCourseDBHandler.removeOngoingCourse(course.id)
    //     OngoingCourseDBHandler.saveChapter(course.id,chapter.id)
    //     CompletedCourseHandler.completeCourse(course)
    //   } else {
    //     console.log("Save Course Progress")
    //     OngoingCourseDBHandler.saveChapter(course.id,chapter.id)
    //   }

    // }
  };



  const onStartCourse = async() => {
    //console.log('Start Course pressed');
    analytics.sendStartCourseEvent(course.id)
    await OngoingCourseDBHandler.saveOngoingCourse(course)
    await CompletedCourseDBHandler.removeCompletedCourse(course.id)
    setIsOngoingCourse(true)
  };

  const onNext = () => {
     if (nextChapter) {
      if (selectedMode === 'read'){
         analytics.sendClickOnNextChaptereEvent(nextChapter.id)
      } else if (selectedMode === 'listen') {
          analytics.sendClickOnNextChaptereAudioEvent(nextChapter.id)
      }
      OngoingCourseDBHandler.saveChapter(course.id,currentChapter.id)
      setCurrentChapter(nextChapter); // Trigger re-render with new data
    }
  };

  const onPrev = () => {
    if (prevChapter) {
      if  ( selectedMode === 'read') {
         analytics.sendClickOnPrevChaptereEvent(prevChapter.id)
      } else if (selectedMode === 'listen') {
          analytics.sendClickOnPrevChaptereAudioEvent(prevChapter.id)
      }
      setCurrentChapter(prevChapter);
    }
  };

  const onComplete = () => {
    //console.log('Completed pressed');
    analytics.sendCompleteCourseEvent(course.id)
    OngoingCourseDBHandler.removeOngoingCourse(course.id)
    CompletedCourseDBHandler.completeCourse(course)
    OngoingCourseDBHandler.saveChapter(course.id,currentChapter.id)
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {selectedMode === 'read' ? (
        htmlContent ? (
    <WebView
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      style={styles.webView}
      injectedJavaScript={injectedJS}
      onMessage={handleWebViewMessage}
    />
      ) : (
       // Original loading view, now only shown if chapterDataLoaded is false and no htmlContent
       // This will be covered by the new overlay if chapterDataLoaded is false
       <View style={styles.emptyDataView}>
         <Text style={styles.emptyDataLabel}>Loading...</Text>
        </View>
      )
      ) : (
           <AudioPlayer
           audioUrl={audioUrl}
           thumbnailUrl={course.thumbnail}
           title={currentChapter.title}
            onNext={onNext}
          onPrev={onPrev} />
    )}
      </View>

      {/* Loading Overlay */}
      {!chapterDataLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.secondaryTheme} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Footer Section */}
      {currentChapter && !(
  selectedMode === 'listen' &&
  isOngoingCourse &&
  currentIndex !== chapterList.length - 1
) && (
  <View style={[styles.footer, { height: footerHeight }]}>
    <View style={styles.ctaContainer}>

      {/* LEFT CTA */}
  {selectedMode === 'read' ? (
    currentIndex === 0 ? (
      !isOngoingCourse && chapterDataLoaded ? (
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
        <Ionicons name="chevron-back-outline" size={28} color={theme.colors.greyDark} />
        <Text style={styles.iconButtonText}>PREV</Text>
      </TouchableOpacity>
    ) : (
      <View style={[styles.iconButton, { width: 0, opacity: 0 }]} />
    )
  ) : selectedMode === 'listen' && currentIndex !== chapterList.length - 1 ? (  
    // Show Start Course in listen mode on first chapter if conditions satisfy

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondaryTheme }]}
          onPress={onStartCourse}
        >
          <Text style={styles.buttonText}>Start Course</Text>
        </TouchableOpacity>


  ) : (
    <View style={{ width: 0 }} />
  )}

  {/* RIGHT CTA */}
  {selectedMode === 'read' ? (
    currentIndex === chapterList.length - 1 ? (
      !(isCourseCompleted || course.isLiveCourse) ? (
        <TouchableOpacity
          style={[styles.button, styles.completeCourseButton]}
          onPress={onComplete}
        >
          <Text style={styles.buttonText}>Complete</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.button, styles.startCourseButton, { opacity: 0 }]} />
      )
    ) : nextChapter ? (
      <TouchableOpacity style={styles.iconButton} onPress={onNext}>
        <Text style={styles.iconButtonText}>NEXT</Text>
        <Ionicons name="chevron-forward-outline" size={28} color={theme.colors.greyDark} />
      </TouchableOpacity>
    ) : (
      <View style={[styles.iconButton, { width: 0, opacity: 0 }]} />
    )
  ) : selectedMode === 'listen' ? (
    // Show Complete button in listen mode on last chapter if conditions satisfy
    currentIndex === chapterList.length - 1 &&
    !(isCourseCompleted || course.isLiveCourse) ? (
      <TouchableOpacity
          style={[styles.button, styles.completeCourseButton]}
          onPress={onComplete}
        >
          <Text style={styles.buttonText}>Complete</Text>
        </TouchableOpacity>
    ) : (
      <View style={{ width: 0 }} />
    )
  ) : (
    <View style={{ width: 0 }} />
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
  ctaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  centeredButtonWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  speakerButton: {
    paddingRight: 16
  },
   toggleContainer: {
    flexDirection: 'row',
    borderColor: theme.colors.greyLight2,
    borderRadius: 20,
    borderWidth: 2,
    padding: 2,
    width: 160,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
  },
  selectedToggleButton: {
    backgroundColor: theme.colors.secondaryTheme,
  },
  toggleText: {
    fontSize: 14,
    color: theme.colors.greyDark,
    fontFamily: 'Roboto-Medium',
  },
  selectedToggleText: {
    color: theme.colors.white,
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
    fontFamily: 'Roboto-Medium',
  },
  title: {
    fontSize: 26,
    color: theme.colors.black,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
  },
  contentText: {
    fontSize: 18,
    color: theme.colors.greyDark1,
    textAlign: 'justify',
    fontFamily: 'Roboto-Medium',
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
    gap: 16
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startCourseButton: {
    backgroundColor: theme.colors.secondaryTheme,
  },
  completeCourseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryTheme,
  },
  greyButton: {
    backgroundColor: theme.colors.greyDark,
  },
  buttonText: {
    color: theme.colors.white,
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
    fontSize: 20
  },
  iconButtonText: {
    color: theme.colors.greyDark,
    fontFamily: 'Roboto-Medium',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconButton: {
    flexDirection: 'row',
    gap: 4,
    width: 84,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  // New styles for the loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it's above other content
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: theme.colors.greyDark,
    fontFamily: 'Roboto-Medium',
  },
});

export default ChapterScreen;
