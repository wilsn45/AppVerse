import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class CourseListAnalytics {

 async sendCourseListImpressionEvent(topic) {
    await AnalyticsHelper.sendEvent(
        'Course_List_Appeared',
        'Course_List',
         ActionType.IMPRESSION,
        {'topic': topic }
     );
  }

  async sendCourseListDataAppearedSuccessEvent(topic) {
    await AnalyticsHelper.sendEvent(
        'Course_List_Data_Appeared_Success',
        'Course_List',
         ActionType.NETWORK,
         {'topic': topic }
     );
  }

  async sendCourseListDataAppearedFailedEvent(topic) {
    await AnalyticsHelper.sendEvent(
        'Course_List_Data_Appeared_Failed',
        'Course_List',
         ActionType.NETWORK,
        {'topic': topic }
     );
  }

  async sendClickOnCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Open_Course',
        'Course_List',
         ActionType.NAVIGATION,
        {'courseId': courseId}
     );
  }

  async sendSaveCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Save_Course',
        'Course_List',
         ActionType.CLICK,
        {'courseId': courseId}
     );
  }

  async sendRemoveSavedCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Remove_Saved_Course',
        'Course_List',
         ActionType.CLICK,
        {'courseId': courseId}
     );
  }

}