export const taskType: TaskType[] = [
    { id: 1, title: 'Routine' },
    { id: 2, title: 'Goal' }
  ];

  ChapterData

  export class ChapterData {
    constructor(id, title, description, thumbnail, duration,index,isLive, isLastChapter, isFirstChapter, nextChapterId, prevChapterId) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.index = index;
      this.thumbnail = thumbnail
      this.duration = duration
      this.isLive = isLive
      this.isLastChapter = isLastChapter
      this.isFirstChapter = isFirstChapter
      this.nextChapterId = nextChapterId
      this.prevChapterId = prevChapterId
    }
  }

  export class CourseData {
    constructor(id, title, description, thumbnail, isLive, rating, duration, topic, isLiveCourse, chaptetCount) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.thumbnail = thumbnail
      this.isLive = isLive
      this.rating = rating
      this.duration = duration
      this.topic = topic
      this.isLiveCourse = isLiveCourse
      this.chaptetCount = chaptetCount
    }
  }

  export class ContentData {
    constructor(id, index, title, description, categoryId, categoryTitle, likeCount, readMin, imageUrl, thumbnail, isLive) {
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
      this.isLive = isLive
    }
  }


  export class SavedContentData {
    constructor(id, title, categoryId, categoryTitle, readMin, thumbnail) {
      this.id = id;
      this.title = title;
      this.categoryId = categoryId;
      this.categoryTitle = categoryTitle;
      this.thumbnail = thumbnail
      this.readMin = readMin
    }
  }

  export class TaskContentData {
    constructor(id, title, categoryId, categoryTitle) {
      this.id = id;
      this.title = title;
      this.categoryId = categoryId;
      this.categoryTitle = categoryTitle;
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

  export class TaskProgress {
    constructor(id, taskId, message, progress, date) {
      this.id = id;
      this.taskId = taskId;
      this.message = message;
      this.progress = progress;
      this.time = date;
    }
  }