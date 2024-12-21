export const taskType: TaskType[] = [
    { id: 1, title: 'Routine' },
    { id: 2, title: 'Goal' }
  ];

  export class ContentData {
    constructor(id, title, description, categoryId, categoryTitle, index, likeCount, imageUrl, thumbnail, readMin) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.categoryId = categoryId;
      this.categoryTitle = categoryTitle;
      this.index = index;
      this.likeCount = likeCount;
      this.imageUrl = imageUrl
      this.thumbnail = thumbnail
      this.readMin = readMin
    }
  }



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
      this.isDone = false
    }
  }