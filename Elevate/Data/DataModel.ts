export const taskType: TaskType[] = [
    { id: 1, title: 'Routine' },
    { id: 2, title: 'Goal' }
  ];

  export class ContentData {
    constructor(id, index, title, description, categoryId, categoryTitle, likeCount, readMin, imageUrl, thumbnail) {
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


  export class CategoryData {
    constructor(id, index, name, thumbnail) {
      this.id = id;
      this.index = index;
      this.name = name;
      this.thumbnail = thumbnail;
    }
  }


  export class TaskData {
    constructor(id, name, type, subType, content,dataAdded) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.subType = subType;
      this.content = content;
      this.dataAdded = dataAdded
      this.isDone = false
    }
  }