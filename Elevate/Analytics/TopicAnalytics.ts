import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class TopicAnalytics {


 async sendTopicListImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        'Topic_List_Appeared',
        'Topic_List',
        ActionType.IMPRESSION,
        {},
     );
  }

  async sendTopicClickEvent(topic) {
    await AnalyticsHelper.sendEvent(
        'Click_On_Topic',
        'Topic_List',
        ActionType.NAVIGATION,
        {'topic': topic},
     );
  }

  async sendTopicDataAppearedSuccessEvent() {
    await AnalyticsHelper.sendEvent(
        'Topics_Data_Appeared_Success',
        'Topic_List',
        ActionType.NETWORK,
        {},
     );
  }

   async sendTopicDataAppearedFailedEvent() {
    await AnalyticsHelper.sendEvent(
        'Topics_Data_Appeared_Failed',
        'Topic_List',
        ActionType.NETWORK,
        {},
     );
  }

}
