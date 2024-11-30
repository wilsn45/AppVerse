import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskData } from '../Data/TaskData';

export class TaskHandler {
  static STORAGE_KEY = 'tasks'; 

  static async getTasks() {
    try {
      const tasks = await AsyncStorage.getItem('tasks');
      return tasks ? JSON.parse(tasks) : {};
    } catch (error) {
      console.error('Error retrieving tasks', error);
      return {};
    }
  }

  // Add a task
  static async addTask(taskName: string, taskType: number, subTaskType: number, contentId: string, contentTitle: String, categoryId: string) {
    try {
      const tasks = await this.getTasks();
      const id = new Date().getTime().toString();
      const dataAdded = new Date().toISOString()
      const taskData = new TaskData(id, taskName, taskType,subTaskType,contentId, contentTitle, categoryId, dataAdded);

      if (!tasks[categoryId]) {
        tasks[categoryId] = [];
      }

      tasks[categoryId].push(taskData); // Add the task to the appropriate category
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks)); // Store updated tasks
      console.log('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  // Remove a task
  static async removeTask(categoryId, taskId) {
    try {
      const tasks = await this.getTasks(); // Retrieve all tasks
      if (tasks[categoryId]) {
        // Filter out the task with the given taskId
        tasks[categoryId] = tasks[categoryId].filter((task) => task.id !== taskId);
  
        // Save the updated tasks object back to AsyncStorage
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
        console.log(`Task with ID: ${taskId} removed from category: ${categoryId}`);
      } else {
        console.warn(`No tasks found for category ID: ${categoryId}`);
      }
    } catch (error) {
      console.error('Error removing task:', error);
    }
  }
}
