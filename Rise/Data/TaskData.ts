export const taskType: TaskType[] = [
    { id: 1, title: 'Routine' },
    { id: 2, title: 'Goal' }
  ];



  export class TaskData {
    constructor(id, name, type, subType, contentId, contentTitle, categoryId, dataAdded) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.subType = subType;
      this.categoryId = categoryId;
      this.contentId = contentId;
      this.contentTitle = contentTitle;
      this.dataAdded = dataAdded
    }
  }