import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class CourseAnalytics {

    courseId;

    // Constructor to accept and save the argument
    constructor(courseId) {
      this.courseId = courseId
    }
  

 async sendCourseImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        'Course_Appeared',
        'Course',
        ActionType.IMPRESSION,
        { 'courseId': this.courseId}
     );
  }

  async sendCourseDataAppearedSuccessEvent() {
    await AnalyticsHelper.sendEvent(
        'Course_Data_Appeared_Success',
        'Course',
         ActionType.NETWORK,
         { 'courseId': this.courseId}
     );
  }

  async sendCourseDataAppearedFailedEvent() {
    await AnalyticsHelper.sendEvent(
        'Course_Data_Appeared_Failed',
        'Course',
         ActionType.NETWORK,
        { 'courseId': this.courseId}
     );
  }

   async sendSaveCourseEvent() {
    await AnalyticsHelper.sendEvent(
        'Save_Course',
        'Course',
         ActionType.CLICK,
        {'courseId': this.courseId}
     );
  }

  async sendRemoveSavedCourseEvent() {
    await AnalyticsHelper.sendEvent(
        'Remove_Saved_Course',
        'Course',
         ActionType.CLICK,
        {'courseId':this. courseId}
     );
  }

  async sendStartCourseEvent() {
    await AnalyticsHelper.sendEvent(
        'Start_Course',
        'Course',
         ActionType.CLICK,
        {'courseId':this. courseId}
     );
  }

  async sendLeaveCourseEvent() {
    await AnalyticsHelper.sendEvent(
        'Leave_Course',
        'Course',
         ActionType.CLICK,
        {'courseId':this. courseId}
     );
  }

  async sendClickOnChapterEvent(chapterId) {
    await AnalyticsHelper.sendEvent(
        'Open_Chapter',
        'Course',
         ActionType.NAVIGATION,
        {'courseId':this. courseId, 'chapterId': chapterId}
     );
  }

  

}