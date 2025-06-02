import firestore from '@react-native-firebase/firestore';
import { CourseData, ChapterData, TopicData } from '../Data/DataModel';

export class ContentAPIClient {
  // Define the key for storing live categories in AsyncStorage

  // Helper function to get the current saved categories from AsyncStorage

  static async fetchTopics() {
    try {

      const snapshot = await firestore()
        .collection('Topics')
        .where('isLive', '==', true)
        .orderBy('index', 'asc')
        .get();
  
      const topicList = snapshot.docs.map(doc => 
        new TopicData(
          doc.id,
          doc.data().title,
          doc.data().index,
          doc.data().thumbnail,
          doc.data().isLive,
        )
      );
  
      return topicList;
  
    } catch (error) {
      console.error('Error fetching topics:', error);
      return null;
    }
  }

  static async fetchRecommendedCourse() {
    try {

      const snapshot = await firestore()
        .collection('Courses')
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
      console.error('Error fetching top rated courses:', error);
      return null;
    }
  }

  static async fetchTopRatedCourse() {
    try {

      const snapshot = await firestore()
        .collection('Courses')
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
      console.error('Error fetching top rated courses:', error);
      return null;
    }
  }


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
        );
      });
  
      return chapters;
  
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }
  }

static async fetchChapter(courseId, chapterId) {
  try {
      // Fetch category list from Home collection
     
      const chapterDocSnapshot = await firestore()
      .collection('Courses')
      .doc(courseId)
      .collection('Chapters')
      .doc(chapterId)
      .collection('Content')
      .doc('Value')
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