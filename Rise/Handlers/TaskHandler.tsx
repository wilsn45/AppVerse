import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const newTask = {
        taskId: new Date().getTime().toString(),
        taskName,
        taskType,
        contentId,
        contentTitle,
        categoryId,
        dateAdded: new Date().toISOString(),
      };

      if (!tasks[categoryId]) {
        tasks[categoryId] = [];
      }

      tasks[categoryId].push(newTask); // Add the task to the appropriate category
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
