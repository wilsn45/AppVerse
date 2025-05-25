import React, { useState, useEffect } from 'react';
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
import { OngoingCourseDBHandler } from '../../DBHandler/OngoingCourseDBHandler.tsx';
import { AdMobDBManager } from '../../DBHandler/AdMobDBManager.tsx';
import { CompletedCourseDBHandler } from '../../DBHandler/CompletedCourseDBHandler.tsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';


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

  const interstitialAdUnitId = Platform.select({
  ios: AdMobDBManager.IOS_APP_ID,
  android: AdMobDBManager.ANDROID_APP_ID,
  default: TestIds.INTERSTITIAL, // fallback to test ID if none found
});

  const interstitial = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
  requestNonPersonalizedAdsOnly: true,
})

  async function showInterstitialAd() {
  const shouldShowAd = await AdMobDBManager.showInterstitialAds();

  if (shouldShowAd) {
    // Load the ad
    interstitial.load();

    // Listen for ad events
    const unsubscribe = interstitial.onAdEvent((type) => {
      if (type === AdEventType.LOADED) {
        interstitial.show();
      }
      if (type === AdEventType.CLOSED) {
        unsubscribe(); // Clean up listener after ad is closed
      }
      if (type === AdEventType.ERROR) {
        console.log('Interstitial Ad failed to load');
        unsubscribe();
      }
    });
  }
}
  

  useEffect(() => {
    analytics.sendChapterImpressionEvent();

    const fetchContent = async () => {
      setChapterDataLoaded(false);
      const doc = await ContentAPIClient.fetchChapter(currentChapter.id);
      setHtmlContent(doc?.htmlContent || '');

      //console.log("current chapter", currentChapter)

      const nextChapter = await ContentAPIClient.fetchNextChapter(course.id, currentChapter.id)
      setNextChapter(nextChapter)
      //console.log("next chapter", nextChapter)

      const prevChapter = await ContentAPIClient.fetchPrevChapter(course.id, currentChapter.id)
      setPrevChapter(prevChapter)
      //console.log("Prev chapter", prevChapter)

      let isCourseOngoing  = await OngoingCourseDBHandler.isCourseOngoing(course.id)
      setIsOngoingCourse(isCourseOngoing)

      let isCourseCompleted  = await CompletedCourseDBHandler.isCourseCompleted(course.id)
      setisCourseCompleted(isCourseCompleted)

      setChapterDataLoaded(true);

      const shouldShowAd = await AdMobDBManager.showInterstitialAds();
      if (shouldShowAd) {
         console.log('Show Ads');
      try {
             await showInterstitialAd();
              console.log('Ad closed, continue app flow');
         } catch {
           console.log('Ad failed or was not shown');
         }
    }

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
    await OngoingCourseDBHandler.saveOngoingCourse(course)
    await CompletedCourseDBHandler.removeCompletedCourse(course.id)
    setIsOngoingCourse(true)
  };
  
  const onNext = () => {
    if (nextChapter) {
      OngoingCourseDBHandler.saveChapter(course.id,currentChapter.id)
      setCurrentChapter(nextChapter); // Trigger re-render with new data
    }
  };
  
  const onPrev = () => {
    if (prevChapter) {
      setCurrentChapter(prevChapter);
    }
  };
  
  const onComplete = () => {
    //console.log('Completed pressed');
    OngoingCourseDBHandler.removeOngoingCourse(course.id)
    CompletedCourseDBHandler.completeCourse(course)
    OngoingCourseDBHandler.saveChapter(course.id,currentChapter.id)
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
          <Ionicons name="chevron-back-outline" size={28} color={theme.colors.greyDark} />
          <Text style={styles.iconButtonText}>PREV</Text>
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
           <Text style={styles.iconButtonText}>NEXT</Text>
          <Ionicons name="chevron-forward-outline" size={28} color={theme.colors.greyDark} />
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
    gap: 16
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
