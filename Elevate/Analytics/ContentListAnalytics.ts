import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class ContentListAnalytics {

    categoryId;

    // Constructor to accept and save the argument
    constructor(categoryId) {
      this.categoryId = categoryId;
    }
  

 async sendContentImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        '4.0.0',
        'Content_List_Appeared',
        'Content_List',
        '',
        ActionType.IMPRESSION,
        '',
        { 'categoryId': this.categoryId}
     );
  }

  async sendContentListPresentedEvent() {
    await AnalyticsHelper.sendEvent(
        '4.1.0',
        'Content_List_Presented',
        'Content_List',
        '',
        ActionType.IMPRESSION,
        '',
        { 'categoryId': this.categoryId}
     );
  }

  async sendContentSavedEvent(isSave, contentId) {
    const optionType =  isSave ? 'Save' : 'Remove'
     const eventId =  isSave ? '4.1.1.1' : '4.1.1.2'
     const eventName =  isSave ? 'Content_Saved' : 'Content_Saved_Removed'
    await AnalyticsHelper.sendEvent(
      eventId,
      eventName,
      'Content_List',
      'Save',
      ActionType.CLICK,
      optionType,
      { 'categoryId': this.categoryId, 'contentId': contentId}
   );
  }

  async sendContentLikedEvent(isLike, contentId) {
    const optionType =  isLike ? 'Like' : 'Remove'
    const eventId =  isLike ? '4.2.1.1' : '4.2.1.2'
     const eventName =  isLike ? 'Content_Liked' : 'Content_Like_Removed'
   await AnalyticsHelper.sendEvent(
     eventId,
     eventName,
     'Content_List',
     'Like',
     ActionType.CLICK,
     optionType,
     { 'categoryId': this.categoryId, 'contentId': contentId}
  );
  }

  async sendAddTaskPresentedEvent(contentId) {
    await AnalyticsHelper.sendEvent(
        '4.3.0',
        'Add_Task_Presented',
        'Content_List',
        'Add_Task',
        ActionType.IMPRESSION,
        '',
        { 'categoryId': this.categoryId, 'contentId': contentId}
     );
  }

  async sendAddTaskEvent(contentId, taskType, freqType) {
    await AnalyticsHelper.sendEvent(
        '4.3.1.2',
        'Add_Task_Cancelled',
        'Content_List',
        'Add_Task',
        ActionType.CLICK,
        'Cancel',
        { 'categoryId': this.categoryId, 'contentId': contentId, 'taskType': taskType, 'freqType': freqType}
     );
  }

  async sendCancelAddTaskPEvent(contentId) {
    await AnalyticsHelper.sendEvent(
        '4.3.1.2',
        'Add_Task_Cancelled',
        'Content_List',
        'Add_Task',
        ActionType.CLICK,
        'Cancel',
        { 'categoryId': this.categoryId, 'contentId': contentId}
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
        { 'categoryId': this.categoryId}
     );
  }

}