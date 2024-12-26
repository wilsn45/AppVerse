import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class SaveAnalytics {

 async sendSaveImpressionEvent(selectedCategoryId) {
    await AnalyticsHelper.sendEvent(
        '2.0.0',
        'Save_Appeared',
        'Save',
        '',
        ActionType.IMPRESSION,
        '',
        { "selectedCategoryId": selectedCategoryId }
      );
  }

  async sendCategoryDisplayedEvent(selectedCategoryId) {
    await AnalyticsHelper.sendEvent(
        '2.1.0',
        'Content_Lis_Presented',
        'Save',
        'Content_List',
        ActionType.IMPRESSION,
        '',
        { "selectedCategoryId": selectedCategoryId }
      );
  }

  async sendContentOpenEvent(categoryId, contentId) {
    await AnalyticsHelper.sendEvent(
        '2.1.1.1',
        'Content_Clicked',
        'Save',
        'Content_List',
        ActionType.CLICK,
        'Open',
        { "categoryId": categoryId, "contentId" : contentId }
      );
  }

  async sendContentRemovedEvent(categoryId, contentId) {
    await AnalyticsHelper.sendEvent(
        '2.1.1.2',
        'Content_Save_Removed',
        'Save',
        'Content_List',
        ActionType.CLICK,
        'Delete',
        { "categoryId": categoryId, "contentId" : contentId }
      );
  }

  async sendCategoryClickedEvent(categoryId) {
    await AnalyticsHelper.sendEvent(
        '2.2.1',
        'Categoy_Filter_Selected',
        'Save',
        'Category_Filter',
        ActionType.CLICK,
        '',
        { "categoryId":  categoryId }
      );
  }

}