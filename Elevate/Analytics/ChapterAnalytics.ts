import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class ChapterAnalytics {


 async sendChapterImpressionEvent(chapterId) {
    await AnalyticsHelper.sendEvent(
        'Chapter_Appeared',
        'Chapter',
        ActionType.IMPRESSION,
        { 'chapterId':  chapterId}
     );
  }

   async sendChapterDataAppearedSuccessEvent(chapterId) {
    await AnalyticsHelper.sendEvent(
        'Chapter_Data_Appeared_Success',
        'Chapter',
         ActionType.NETWORK,
          { 'chapterId': chapterId}
     );
  }

  async sendChapterDataAppearedFailedEvent(chapterId) {
    await AnalyticsHelper.sendEvent(
        'Chapter_Data_Appeared_Failed',
        'Chapter',
         ActionType.NETWORK,
         { 'chapterId': chapterId}
     );
  }

  async sendStartCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Start_Course',
        'Chapter',
        ActionType.CLICK,
        { 'courseId': courseId}
     );
  }

  async sendCompleteCourseEvent(courseId) {
    await AnalyticsHelper.sendEvent(
        'Complete_Course',
        'Chapter',
        ActionType.CLICK,
        { 'courseId': courseId}
     );
  }

  async sendClickOnNextChaptereEvent(chapterId) {
    await AnalyticsHelper.sendEvent(
        'Open_Next_Chapter',
        'Chapter',
        ActionType.NAVIGATION,
        { 'chapterId': chapterId}
     );
  }

   async sendClickOnPrevChaptereEvent(chapterId) {
    await AnalyticsHelper.sendEvent(
        'Open_Prev_Chapter',
        'Chapter',
        ActionType.NAVIGATION,
        { 'chapterId': chapterId}
     );
  }

  async sendClickOnNextChaptereAudioEvent(chapterId) {
    await AnalyticsHelper.sendEvent(
        'Play_Next_Audio',
        'Chapter',
        ActionType.NAVIGATION,
        { 'chapterId': chapterId}
     );
  }

   async sendClickOnPrevChaptereAudioEvent(chapterId) {
    await AnalyticsHelper.sendEvent(
        'Play_Prev_Audio',
        'Chapter',
        ActionType.NAVIGATION,
        { 'chapterId': chapterId}
     );
  }

   async sendClickOnNextChaptereVideoEvent(chapterId) {
    await AnalyticsHelper.sendEvent(
        'Play_Next_Video',
        'Chapter',
        ActionType.NAVIGATION,
        { 'chapterId': chapterId}
     );
  }

   async sendClickOnPrevChaptereVideoEvent(chapterId) {
    await AnalyticsHelper.sendEvent(
        'Play_Prev_Video',
        'Chapter',
        ActionType.NAVIGATION,
        { 'chapterId': chapterId}
     );
  }


}
