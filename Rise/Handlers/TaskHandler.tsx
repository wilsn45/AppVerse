import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskData } from '../Data/TaskData';

export class TaskHandler {
  // Helper function to get the current tasks from AsyncStorage
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
  static async addTask(taskName: string, taskType: number, contentId: string, contentTitle: String, categoryId: string) {
    try {
      const tasks = await this.getTasks();
      const id = new Date().getTime().toString();
      const dataAdded = new Date().toISOString()
      const taskData = new TaskData(id, taskName, taskType,contentId, contentTitle, categoryId, dataAdded);

      if (!tasks[categoryId]) {
        tasks[categoryId] = [];
      }

      tasks[categoryId].push(taskData); // Add the task to the appropriate category
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks)); // Store updated tasks
      console.log('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  // Remove a task
  static async removeTask(categoryId: string, taskId: string) {
    try {
      const tasks = await this.getTasks();
      if (tasks[categoryId]) {
        tasks[categoryId] = tasks[categoryId].filter((task: { taskId: string }) => task.taskId !== taskId);
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      }
    } catch (error) {
      console.error('Error removing task:', error);
    }
  }
}
