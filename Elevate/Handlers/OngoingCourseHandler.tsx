import AsyncStorage from '@react-native-async-storage/async-storage';

export class OngoingCourseHandler {
  static STORAGE_KEY_CHAPTERS = 'ONGOING_CHAPTERS';

  // Save a chapter ID for a course
  static async saveChapter(courseId: string, chapterId: string | null): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_CHAPTERS);
      const courses = data ? JSON.parse(data) : {};

      if (!courses[courseId]) {
        // If course not present, create new entry
        courses[courseId] = chapterId ? [chapterId] : [];
      } else if (chapterId && !courses[courseId].includes(chapterId)) {
        // If chapterId is new, append it
        courses[courseId].push(chapterId);
      }

      console.log("Ongoing Course:", courses[courseId])

      await AsyncStorage.setItem(this.STORAGE_KEY_CHAPTERS, JSON.stringify(courses));
    } catch (error) {
      console.error('Error saving chapter progress:', error);
    }
  }

  // Get all completed chapter IDs for a course
  static async getCompletedChapters(courseId: string): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_CHAPTERS);
      const courses = data ? JSON.parse(data) : {};
      return courses[courseId] || [];
    } catch (error) {
      console.error('Error retrieving completed chapters:', error);
      return [];
    }
  }

  static STORAGE_KEY_ONGOING_COURSES = 'ONGOING_COURSES';

  // Get all saved courses
  static async getOngoingingCourses(): Promise<any[]> {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEY_ONGOING_COURSES);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error retrieving saved courses:', error);
      return [];
    }
  }

  // Save a course
  static async saveOngoingCourse(course: any): Promise<void> {
    try {
      const currentCourses = await this.getOngoingingCourses();
      const exists = currentCourses.some(c => c.id === course.id);

      if (!exists) {
        currentCourses.push(course);
        await AsyncStorage.setItem(this.STORAGE_KEY_ONGOING_COURSES, JSON.stringify(currentCourses));
      }
      // const updatedCourses = await this.getSavedCourses();
      // console.log('Updated saved list after save:', updatedCourses.map(c => c.id));
    } catch (error) {
      console.error('Error saving course:', error);
    }
  }

  // Remove a course
  static async removeOngoingCourse(id: string): Promise<void> {
    try {
      const currentCourses = await this.getOngoingingCourses();
      const updated = currentCourses.filter(c => c.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEY_ONGOING_COURSES, JSON.stringify(updated));
      // const updatedCourses = await this.getSavedCourses();
      // console.log('Updated saved list after save:', updatedCourses.map(c => c.id));
    } catch (error) {
      console.error('Error removing course:', error);
    }
  }

  // Check if course is saved
  static async isCourseOngoing(id: string): Promise<boolean> {
    try {
      const currentCourses = await this.getOngoingingCourses();
     // console.log("All Courses", currentCourses)
      return currentCourses.some(c => c.id === id);
    } catch (error) {
      console.error('Error checking if course is saved:', error);
      return false;
    }
  }

  
}