import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskData, ContentData } from '../../Data/DataModel';

export class TaskHandler {
  static STORAGE_KEY = 'tasks'; 

  static async getTasks() {
    try {
      const tasks = await AsyncStorage.getItem(this.STORAGE_KEY);
      return tasks ? JSON.parse(tasks) : {};
    } catch (error) {
      console.error('Error retrieving tasks', error);
      return {};
    }
  }

  // Add a task
  static async addTask(taskName: string, taskType: number, subTaskType: number, content: ContentData) {
    try {
      const tasks = await this.getTasks();
      const id = new Date().getTime().toString();
      const dataAdded = new Date().toISOString()
      const taskData = new TaskData(id, taskName, taskType,subTaskType, content, dataAdded);

      if (!tasks[content.categoryId]) {
        tasks[content.categoryId] = [];
      }

      tasks[content.categoryId].push(taskData); // Add the task to the appropriate category
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

  static async updateTaskState(categoryId, taskId, state) {
    try {
      // Retrieve all tasks from AsyncStorage
      const tasks = await this.getTasks(); // Assume this method gets the tasks object
  
      // Check if the category exists
      if (tasks[categoryId]) {
        // Find the task within the category
        const taskIndex = tasks[categoryId].findIndex((task) => task.id === taskId);
  
        if (taskIndex !== -1) {
          // Update the 'isDone' property to true
          tasks[categoryId][taskIndex].isDone = state;
  
          // Save the updated tasks object back to AsyncStorage
          await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
  
          console.log(`Task with ID: ${taskId} marked as done in category: ${categoryId}`);
        } else {
          console.log(`Task with ID: ${taskId} not found in category: ${categoryId}`);
        }
      } else {
        console.log(`No tasks found for category ID: ${categoryId}`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }
  
}
