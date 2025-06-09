import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class MyCourseAnalytics {

 async sendMyCourseImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        'My_Course_Appeared',
        'My_Course',
        ActionType.IMPRESSION,
        { }
      );
  }

  async sendClickOnCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Open_Course',
        'My_Course',
        ActionType.NAVIGATION,
        {'courseId': courseId }
      );
  }

  async sendViewSavedCourseImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        'View_Saved_Course',
        'My_Course',
        ActionType.IMPRESSION,
        { }
      );
  }

  async sendViewInProgressCourseImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        'View_InProgress_Course',
        'My_Course',
        ActionType.IMPRESSION,
        { }
      );
  }

  async sendViewCompletedCourseImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        'View_Completed_Course',
        'My_Course',
        ActionType.IMPRESSION,
        { }
      );
  }

  async sendRemoveFromSavedCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Remove_From_Saved_Course',
        'My_Course',
        ActionType.CLICK,
        {'courseId': courseId }
      );
  }

  async sendRemoveFromInProgressCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Remove_From_InProgress_Course',
        'My_Course',
        ActionType.CLICK,
        {'courseId': courseId }
      );
  }

  async sendRemoveFromCompletedCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Remove_From_Completed_Course',
        'My_Course',
        ActionType.CLICK,
        {'courseId': courseId }
      );
  }

}
