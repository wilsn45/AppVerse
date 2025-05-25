import AsyncStorage from '@react-native-async-storage/async-storage';

export class SaveDBHandler {
  static STORAGE_KEY = 'SAVED_COURSES';

  // Get all saved courses
  static async getSavedCourses(): Promise<any[]> {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error retrieving saved courses:', error);
      return [];
    }
  }

  // Save a course
  static async saveCourse(course: any): Promise<void> {
    try {
      const currentCourses = await this.getSavedCourses();
      const exists = currentCourses.some(c => c.id === course.id);

      if (!exists) {
        currentCourses.push(course);
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentCourses));
      }
      // const updatedCourses = await this.getSavedCourses();
      // console.log('Updated saved list after save:', updatedCourses.map(c => c.id));
    } catch (error) {
      console.error('Error saving course:', error);
    }
  }

  // Remove a course
  static async removeCourse(id: string): Promise<void> {
    try {
      const currentCourses = await this.getSavedCourses();
      const updated = currentCourses.filter(c => c.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      // const updatedCourses = await this.getSavedCourses();
      // console.log('Updated saved list after save:', updatedCourses.map(c => c.id));
    } catch (error) {
      console.error('Error removing course:', error);
    }
  }

  // Check if course is saved
  static async isCourseSaved(id: string): Promise<boolean> {
    try {
      const currentCourses = await this.getSavedCourses();
      return currentCourses.some(c => c.id === id);
    } catch (error) {
      console.error('Error checking if course is saved:', error);
      return false;
    }
  }

}