import firestore from '@react-native-firebase/firestore';
import { CategoryHandler } from './CategoryHandler';
import { CourseData, ChapterData } from '../Data/DataModel';

export class ContentHandler {
  // Define the key for storing live categories in AsyncStorage
  static LIVE_HOME_STORAGE_KEY = 'Home';

  // Helper function to get the current saved categories from AsyncStorage


  static async fetchCourseByTopic(topic) {
    try {

      const snapshot = await firestore()
        .collection('Courses')
        .where('topic', '==', topic)
        .where('isLive', '==', true)
        .orderBy('rating', 'desc')
        .orderBy('lastUpdatedTimestamp', 'desc')
        .get();
  
      const coursesList = snapshot.docs.map(doc => 
        new CourseData(
          doc.id,
          doc.data().title,
          doc.data().description,
          doc.data().thumbnail,
          doc.data().isLive,
          doc.data().rating,
          doc.data().duration,
          doc.data().topic,
          doc.data().isLiveCourse,
          doc.data().chapterCount
        )
      );
  
      return coursesList;
  
    } catch (error) {
      console.error('Error fetching courses by topic:', error);
      return null;
    }
  }

  static async fetchChapters(courseId) {
    try {
     
      const chapterDocs = await firestore()
        .collection('Courses')
        .doc(courseId)
        .collection('Chapters')
        .where('isLive', '==', true)
        .orderBy('index', 'asc')
        .get();
  
      if (chapterDocs.empty) {
        console.warn(`No chapters found for courseId: ${courseId}`);
        return [];
      }
  
      const chapters = chapterDocs.docs.map(doc => {
        const item = doc.data();
        // console.log("Chapter: ", item)
        // console.log("**********")
        return new ChapterData(
          doc.id,
          item.title,
          item.description,
          item.thumbnail,
          item.duration,
          item.index,
          item.isLive,
          item.isLastChapter,
          item.isFirstChapter,
          item.nextChapterId,
          item.prevChapterId
        );
      });
  
      return chapters;
  
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }
  }

  static async fetchNextChapter(courseId, currentChapterId) {
    try {
      const currentChapterDoc = await firestore()
        .collection('Courses')
        .doc(courseId)
        .collection('Chapters')
        .doc(currentChapterId)
        .get();
  
      if (!currentChapterDoc.exists) {
        console.warn(`Chapter ${currentChapterId} not found in course ${courseId}`);
        return null;
      }
  
      const nextChapterId = currentChapterDoc.data().nextChapterId;
  
      if (!nextChapterId) {
        console.warn('No next chapter found');
        return null;
      }
  
      const nextChapterDoc = await firestore()
        .collection('Courses')
        .doc(courseId)
        .collection('Chapters')
        .doc(nextChapterId)
        .get();
  
      if (!nextChapterDoc.exists) {
        console.warn(`Next chapter ${nextChapterId} not found`);
        return null;
      }
  
      const item = nextChapterDoc.data();
      return new ChapterData(
        nextChapterDoc.id,
        item.title,
        item.description,
        item.thumbnail,
        item.duration,
        item.index,
        item.isLive,
        item.isLastChapter,
        item.isFirstChapter,
        item.nextChapterid,
        item.prevChapterId
      );
  
    } catch (error) {
      console.error('Error fetching next chapter:', error);
      return null;
    }
  }


  static async fetchPrevChapter(courseId, currentChapterId) {
    try {
      const currentChapterDoc = await firestore()
        .collection('Courses')
        .doc(courseId)
        .collection('Chapters')
        .doc(currentChapterId)
        .get();
  
      if (!currentChapterDoc.exists) {
        console.warn(`Chapter ${currentChapterId} not found in course ${courseId}`);
        return null;
      }
  
      const lastChapterId = currentChapterDoc.data().prevChapterId;
  
      if (!lastChapterId) {
        console.warn('No previous chapter found');
        return null;
      }
  
      const lastChapterDoc = await firestore()
        .collection('Courses')
        .doc(courseId)
        .collection('Chapters')
        .doc(lastChapterId)
        .get();
  
      if (!lastChapterDoc.exists) {
        console.warn(`Previous chapter ${lastChapterId} not found`);
        return null;
      }
  
      const item = lastChapterDoc.data();
      return new ChapterData(
        lastChapterDoc.id,
        item.title,
        item.description,
        item.thumbnail,
        item.duration,
        item.index,
        item.isLive,
        item.isLastChapter,
        item.isFirstChapter,
        item.nextChapterid,
        item.prevChapterId
      );
  
    } catch (error) {
      console.error('Error fetching previous chapter:', error);
      return null;
    }
  }


static async fetchChapter(chapterId) {
  try {
      // Fetch category list from Home collection
     
      const chapterDocSnapshot = await firestore()
      .collection('Chapters')
      .doc(chapterId)
      .get();

      //console.log("Fetched Content data", contetnDocSnapshot.data())

      if (chapterDocSnapshot.exists) { 
          return chapterDocSnapshot.data()
      }
      else {
          return null
      }

  } catch (error) {
      console.error('Error fetching data:', error);
      return null
  } 
}

}