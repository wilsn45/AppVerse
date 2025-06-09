import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class HomeAnalytics {

 async sendHomeImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        'Home_Appeared',
        'Home',
        ActionType.IMPRESSION,
        {}
      );
  }

  async sendHomeDataAppearedSuccessEvent() {
    await AnalyticsHelper.sendEvent(
        'Home_Data_Appeared_Success',
        'Home',
        ActionType.NETWORK,
        {}
      );
  }

  async sendHomeDataAppearedFailedEvent() {
    await AnalyticsHelper.sendEvent(
        'Home_Data_Appeared_Failed',
        'Home',
        ActionType.NETWORK,
        {}
      );
  }


  async sendOpenTopicEvent(topic) {
    await AnalyticsHelper.sendEvent(
        'Open_Topic',
        'Home',
        ActionType.NAVIGATION,
        { 'topic': topic }
      );
  }

  async sendNavigateToLoginEvent() {
    await AnalyticsHelper.sendEvent(
        'Navigate_To_Login',
        'Home',
        ActionType.NAVIGATION
      );
  }

  async sendOpenCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Open_Course',
        'Home',
        ActionType.NAVIGATION,
        { 'courseId' :  courseId }
      );
  }

  async sendSaveCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Save_Course',
        'Home',
        ActionType.CLICK,
        { 'courseId' :  courseId }
      );
  }

  async sendRemoveSavedCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Remove_Saved_Course',
        'Home',
        ActionType.CLICK,
        { 'courseId' :  courseId }
      );
  }

  async sendViewAllTopicsEvent() {
    await AnalyticsHelper.sendEvent(
        'View_All_Topic',
        'Home',
        ActionType.NAVIGATION,
        {}
      );
  }

  async sendViewAllRecentlySavedCourseEvent() {
    await AnalyticsHelper.sendEvent(
        'View_All_Recently_Saved_Course',
        'Home',
        ActionType.NAVIGATION,
        {}
      );
  }

  async sendViewAllTopRatedCourseEvent() {
    await AnalyticsHelper.sendEvent(
        'View_All_Top_Rated_Course',
        'Home',
        ActionType.NAVIGATION,
        {}
      );
  }

  async sendViewAllRecommendedCourseEvent() {
    await AnalyticsHelper.sendEvent(
        'View_All_Recommended_Course',
        'Home',
        ActionType.NAVIGATION,
        {}
      );
  }

  async sendViewAllOngoingCourseCvent() {
    await AnalyticsHelper.sendEvent(
        'View_All_Ongoing_Course',
        'Home',
        ActionType.NAVIGATION,
        {}
      );
  }

}
