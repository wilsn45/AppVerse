import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class ContentAnalytics {

    content;

  // Constructor to accept and save the argument
  constructor(content) {
    this.content = content;
  }

 async sendContentImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        '5.0.0',
        'Content_Detail_Appeared',
        'Content_Detail',
        '',
        ActionType.IMPRESSION,
        '',
        { 'categoryId': this.content.categoryId, "contentId": this.content.id}
     );
  }

  async sendContentListPresentedEvent() {
    await AnalyticsHelper.sendEvent(
        '5.1.0',
        'Content_Presented',
        'Content_Detail',
        'Content',
        ActionType.IMPRESSION,
        '',
        { 'categoryId': this.content.categoryId, "contentId": this.content.id}
     );
  }

  async sendContentListPresentedEvent(isSave) {
    const optionType =  isSave ? 'Save' : 'Remove'
    const eventId =  isSave ? '5.1.1.1' : '5.1.1.2'
    const eventName =  isSave ? 'Content_Saved' : 'Content_Saved_Removed'
   await AnalyticsHelper.sendEvent(
     eventId,
     eventName,
     'Content_Detail',
     'Save',
     ActionType.CLICK,
     optionType,
     { 'categoryId': this.content.categoryId, 'contentId':this.content.id}
  );
  }

  async sendContentSavedEvent(isSave) {
   const optionType =  isSave ? 'Save' : 'Unsave'
   const eventId =  isSave ? '5.1.1.1' : '5.1.1.2'
    const eventName =  isSave ? 'Content_Saved' : 'Content_Saved_Removed'
  await AnalyticsHelper.sendEvent(
    eventId,
    eventName,
    'Content_Detail',
    'Like',
    ActionType.CLICK,
    optionType,
    { 'categoryId': this.content.categoryId, 'contentId': this.content.id}
  );
}

  async sendContentLikedEvent(isLike) {
    const optionType =  isLike ? 'Like' : 'Remove'
    const eventId =  isLike ? '5.2.1.1' : '5.2.1.2'
     const eventName =  isLike ? 'Content_Liked' : 'Content_Like_Removed'
   await AnalyticsHelper.sendEvent(
     eventId,
     eventName,
     'Content_Detail',
     'Like',
     ActionType.CLICK,
     optionType,
     { 'categoryId': this.content.categoryId, 'contentId': this.content.id}
   );
 }

 async sendAddTaskPresentedEvent() {
    await AnalyticsHelper.sendEvent(
        '5.3.0',
        'Add_Task_Presented',
        'Content_Detail',
        'Add_Task',
        ActionType.IMPRESSION,
        '',
        { 'categoryId': this.content.categoryId, 'contentId': this.content.id}
     );
 }

 async sendAddTaskEvent(taskType,freqType) {
    await AnalyticsHelper.sendEvent(
        '5.3.1.2',
        'Add_Task_Cancelled',
        'Content_Detail',
        'Add_Task',
        ActionType.CLICK,
        'Cancel',
        { 'categoryId': this.content.categoryId, 'contentId': this.content.id, 'taskType': taskType, 'freqType': freqType}
     );
 }

 async sendCancelAddTaskPEvent() {
    await AnalyticsHelper.sendEvent(
        '5.3.1.2',
        'Add_Task_Cancelled',
        'Content_Detail',
        'Add_Task',
        ActionType.CLICK,
        'Cancel',
        { 'categoryId': this.content.categoryId, 'contentId': this.content.id}
     );
 }

 async sendBackEvent() {
    await AnalyticsHelper.sendEvent(
        '5.4.1.1',
        'Back_Clicked',
        'Content_List',
        'Header',
        ActionType.CLICK,
        'Back',
        { 'categoryId': content.categoryId}
     );
 }

}