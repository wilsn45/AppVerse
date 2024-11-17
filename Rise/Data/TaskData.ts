export const taskType: TaskType[] = [
    { id: 1, title: 'Routine' },
    { id: 2, title: 'Target' }
  ];



  export class TaskData {
    constructor(id, name, type, categoryId, contentId, contentTitle,dataAdded) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.categoryId = categoryId;
      this.contentId = contentId;
      this.contentTitle = contentTitle;
      this.dataAdded = dataAdded
    }
  }