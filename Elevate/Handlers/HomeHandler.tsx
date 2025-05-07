import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { CategoryHandler } from './CategoryHandler';
import { CourseData, CategoryData } from '../Data/DataModel';


export class HomeHandler {
  // Define the key for storing live categories in AsyncStorage
  static LIVE_HOME_STORAGE_KEY = 'Home';

  // Helper function to get the current saved categories from AsyncStorage


  static async fetchLatestHomeData() {
      try {
          // Fetch category list from Home collection
          const categorySnapshot = await firestore().collection('Home').get();

          // Sort categories by index in ascending order
          const categories = categorySnapshot.docs
              .map(doc => ({
                  id: doc.id,
                  name: doc.data().name,
                  index: doc.data().index,
              }))
              .sort((a, b) => a.index - b.index);

            console.log("categories -->", categories)

          const Home = {};

          for (const category of categories) {
              const collectionName = category.id;
              const colRef = firestore().collection(`Home/${collectionName}/List`);
              const snapshot = await colRef.get();

              console.log("snapshot -->", snapshot)

              if (collectionName === 'LiveCategories') {
                Home["Categories"] = snapshot.docs.map(doc => 
                  new CategoryData(doc.id, doc.data().index, doc.data().name, doc.data().thumbnail)
              );
              } else {
                Home[category.name] = snapshot.docs.map(doc => 
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
              }
          }

        // console.log('Fetched Data:', Home);
         // sendCategoryFetchEvent();

          // Save LiveCategories using CategoryHandler
          await this.setHomeData(Home)
          await CategoryHandler.setLiveCategory(Home["Categories"])
          return true 
      } catch (error) {
          console.error('Error fetching data:', error);
          return false
      } 
  }


  static async getHomeData() {
    try {
      const homeData = await AsyncStorage.getItem(this.LIVE_HOME_STORAGE_KEY);
      return homeData ? JSON.parse(homeData) : [];
    } catch (error) {
      console.error('Error retrieving categories', error);
      return [];
    }
  }

  // Get the live categories from AsyncStorage
  static async getHome() {
    return await this.getHomeData();
  }

  // Add or update categories in AsyncStorage
  static async setHomeData(home) {
    try {
      await AsyncStorage.setItem(this.LIVE_HOME_STORAGE_KEY, JSON.stringify(home));
      
    } catch (error) {
      console.error('Error saving home data:', error.message);
    }
  }

}
