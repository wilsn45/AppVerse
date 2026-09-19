import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskProgress } from '../../Data/DataModel';

class RoutineTaskHandler {
  static STORAGE_KEY = 'RoutineTaskRecords';

  static async addRecord(newProgress) {
    try {
      const existingRecords = await this.getAllRecords();
      const updatedRecords = [...existingRecords, newProgress];

      // Save the updated records back to AsyncStorage
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRecords));
     // console.log(`Record added successfully for recordId: ${newProgress.recordId}`);
    } catch (error) {
      console.error('Error adding record:', error);
    }
  }

  static async getAllRecords() {
    try {
      const allRecords = await AsyncStorage.getItem(this.STORAGE_KEY);

      if (!allRecords) return []; // Return an empty array if no records exist

      const parsedRecords = JSON.parse(allRecords);

      console.log(`ParsedRecords: ${parsedRecords}`);

      return parsedRecords;
    } catch (error) {
      console.error('Error retrieving records:', error);
      return [];
    }
  }


  static async getAllRecordsForTask(taskId) {
    try {
      const allRecords = await AsyncStorage.getItem(this.STORAGE_KEY);

      if (!allRecords) return []; // Return an empty array if no records exist

      const parsedRecords = JSON.parse(allRecords);

      // Filter records by taskId
      const filteredRecords = parsedRecords.filter(record => record.taskId === taskId);
      return filteredRecords;
    } catch (error) {
      console.error('Error retrieving records:', error);
      return [];
    }
  }

  static async removeAllRecordsForTask(taskId) {
    try {
      const allRecords =  await this.getAllRecords();

      // Filter out the records for the given taskId
      const updatedRecords = allRecords.filter(record => record.taskId !== taskId);

      // Save the updated records back to AsyncStorage
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRecords));
      console.log(`All records for taskId: ${taskId} have been removed.`);
    } catch (error) {
      console.error('Error removing records for task:', error);
    }
  }

  static async removeRecord(recordId) {
    try {
      const allRecords = await this.getAllRecords();

      // Filter out the record with the given recordId
      const updatedRecords = allRecords.filter(record => record.id !== recordId);

      // Save the updated records back to AsyncStorage
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedRecords));
      console.log(`Record with recordId: ${recordId} has been removed.`);
    } catch (error) {
      console.error('Error removing record:', error);
    }
  }

}



export default RoutineTaskHandler;
