import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class ChapterAnalytics {

  chapterId;

  // Constructor to accept and save the argument
  constructor(chapterId) {
    this.chapterId = chapterId;
  }

 async sendChapterImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        '5.0.0',
        'Chapter_Appeared',
        'Chapter_Detail',
        '',
        ActionType.IMPRESSION,
        '',
        { 'chapterId': this.chapterId}
     );
  }

  async sendChapterPresentedEvent() {
    await AnalyticsHelper.sendEvent(
        '5.1.0',
        'Chapter_Presented',
        'Chapter_Detail',
        'Chapter',
        ActionType.IMPRESSION,
        '',
        { 'chapterId': this.chapterId}
     );
  }


 async sendBackEvent() {
    await AnalyticsHelper.sendEvent(
        '5.4.1.1',
        'Back_Clicked',
        'Chapter_List',
        'Header',
        ActionType.CLICK,
        'Back',
        { 'chapterId': this.chapterId}
     );
 }

}