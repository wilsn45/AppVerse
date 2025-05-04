import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class CourseListAnalytics {

   topic;

    // Constructor to accept and save the argument
    constructor(topic) {
      this.topic = topic;
    }
  

 async sendCourseListImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        '4.0.0',
        'Course_List_Appeared',
        'Course_List',
        '',
        ActionType.IMPRESSION,
        '',
        { 'topic': this.topic}
     );
  }

  async sendCourseListPresentedEvent() {
    await AnalyticsHelper.sendEvent(
        '4.1.0',
        'Course_List_Presented',
        'Course_List',
        '',
        ActionType.IMPRESSION,
        '',
        { 'topic': this.topic}
     );
  }

  async sendCourseSavedEvent(isSave, courseId) {
    const optionType =  isSave ? 'Save' : 'Remove'
     const eventId =  isSave ? '4.1.1.1' : '4.1.1.2'
     const eventName =  isSave ? 'Course_Saved' : 'Course_Saved_Removed'
    await AnalyticsHelper.sendEvent(
      eventId,
      eventName,
      'Course_List',
      'Save',
      ActionType.CLICK,
      optionType,
      { 'topic': this.topic, 'courseId': courseId}
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
        { 'topic': this.topic}
     );
  }

}