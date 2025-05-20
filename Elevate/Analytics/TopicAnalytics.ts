import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class TopicAnalytics {


 async sendTopicListImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        '4.0.0',
        'Course_List_Appeared',
        'Course_List',
        '',
        ActionType.IMPRESSION,
        '',
     );
  }

  async sendTopicListPresentedEvent() {
    await AnalyticsHelper.sendEvent(
        '4.1.0',
        'Course_List_Presented',
        'Course_List',
        '',
        ActionType.IMPRESSION,
        '',
     );
  }

  async sendTopicClickedEvent(topic) {
     const eventId =   '4.1.1.2'
     const eventName = 'Topic_Clicked'
    await AnalyticsHelper.sendEvent(
      eventId,
      eventName,
      'Course_List',
      'Save',
      ActionType.CLICK,
      { 'topic': topic}
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