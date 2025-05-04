import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class HomeAnalytics {

 async sendHomeImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        '1.0.0',
        'Home_Appeared',
        'Home',
        '',
        ActionType.IMPRESSION,
        '',
        {}
      );
  }

 async sendCategoryDisplayedEvent(categoryList) {
    await AnalyticsHelper.sendEvent(
        '1.1.0',
        'Category_Displayed',
        'Home',
        'Category_List',
        ActionType.IMPRESSION,
        '',
        { "categoryList": categoryList }
      );
  }

  async sendCategoryClickedEvent(topic) {
    await AnalyticsHelper.sendEvent(
        '1.1.1',
        'Category_Clicked',
        'Home',
        'Category_List',
        ActionType.CLICK,
        '',
        { "topic": topic }
      );
  }

  async sendContentOpenEvent(categoryId, contentId) {
    await AnalyticsHelper.sendEvent(
        '1.2.1',
        'Content_Open',
        'Save',
        'Section_List',
        ActionType.CLICK,
        'Open',
        { "categoryId" : categoryId, "contentId":  contentId }
      );
  }

}