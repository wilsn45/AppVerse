import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform
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
      
      setChapterDataLoaded(false);
      const doc = await ContentAPIClient.fetchChapter(currentChapter.id);
      setHtmlContent(doc?.htmlContent || '');
      setAudioUrl(doc?.audioUrl || '');
      console.log("audioUrl", doc?.audioUrl)
      analytics.sendChapterDataAppearedSuccessEvent(currentChapter.id)
      
      //console.log("current chapter", currentChapter)

      const index = chapterList.findIndex(ch => ch.id === currentChapter.id);
      
      setPrevAndNextChapters(index)


      let isCourseOngoing  = await OngoingCourseDBHandler.isCourseOngoing(course.id)
      setIsOngoingCourse(isCourseOngoing)

      let isCourseCompleted  = await CompletedCourseDBHandler.isCourseCompleted(course.id)
      setisCourseCompleted(isCourseCompleted)

      setChapterDataLoaded(true);
      const shouldShowAd =  await AdMobDBHandler.showInterstitialAds();
     
     if (shouldShowAd) {
       // console.log('Show Ads');

     try {
        //  await AdMobAPIClient.showInterstitialAd();
        //   await UserReferrerAPI.addAdImpression(course.id, currentChapter.id);
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
  ) : selectedMode === 'listen' ? (
    // Show Start Course in listen mode on first chapter if conditions satisfy
    chapterDataLoaded ? (
      
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondaryTheme }]}
          onPress={onStartCourse}
        >
          <Text style={styles.buttonText}>Start Course</Text>
        </TouchableOpacity>
    
    ) : (
      <View style={{ width: 0 }} />
    )
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
          <Text style={styles.buttonText}>Completed</Text>
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
      <View style={styles.centeredButtonWrapper}>
        <TouchableOpacity
          style={[styles.button, styles.completeCourseButton]}
          onPress={onComplete}
        >
          <Text style={styles.buttonText}>Completed</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    marginVertical: 20,
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
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedToggleButton: {
    backgroundColor: theme.colors.greyDark2, // change to your dark theme color
  },
  toggleText: {
    fontSize: 14,
    color: theme.colors.greyDark,
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
    fontWeight: '500',
    fontSize: 20
  },
  iconButtonText: {
    color: theme.colors.greyDark,
    fontWeight: 'bold',
    fontSize: 16
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
});

export default ChapterScreen;
