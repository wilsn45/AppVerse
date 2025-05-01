import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class CourseAnalytics {

    categoryId;
    courseId;

    // Constructor to accept and save the argument
    constructor(categoryId,courseId) {
      this.categoryId = categoryId;
      this.courseId = courseId
    }
  

 async sendCourseImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        '10.0.0',
        'Course_Appeared',
        'Course',
        '',
        ActionType.IMPRESSION,
        '',
        { 'categoryId': this.categoryId, 'courseId': this.courseId}
     );
  }

  async sendCoursePresentedEvent() {
    await AnalyticsHelper.sendEvent(
        '10.1.0',
        'Course_Presented',
        'Course',
        '',
        ActionType.IMPRESSION,
        '',
        { 'categoryId': this.categoryId, 'courseId': this.courseId}
     );
  }

  async sendCourseOpenEvent() {
     const eventId =   '10.1.1.1' 
     const eventName =  'Chapter_Opened' 
    await AnalyticsHelper.sendEvent(
      eventId,
      eventName,
      'Course_List',
      'Save',
      ActionType.CLICK,
      '',
      { 'categoryId': this.categoryId, 'courseId': this.courseId}
   );
  }

  async sendBackEvent() {
    await AnalyticsHelper.sendEvent(
        '4.4.1.1',
        'Back_Clicked',
        'Content_List',
        'Header',
        ActionType.CLICK,
        'Back',
        { 'categoryId': this.categoryId}
     );
  }

}