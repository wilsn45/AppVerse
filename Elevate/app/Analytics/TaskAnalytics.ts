import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class TaskAnalytics {

 async sendSaveImpressionEvent(selectedCategoryId, selectedTaskType) {
    await AnalyticsHelper.sendEvent('3.0.0', 'Task_Appeared', 'Task', '', ActionType.IMPRESSION, '', {
        "selectedCategoryId" : selectedCategoryId,
        "selectedTaskType" : selectedTaskType,
      });
  }

  async sendCategoryDisplayedEvent(selectedCategoryId, selectedTaskType) {
    await AnalyticsHelper.sendEvent('3.1.0', 'Content_List_Presented', 'Task', 'Content_List', ActionType.IMPRESSION, '', {
        "selectedCategoryId" : selectedCategoryId,
        "selectedTaskType" : selectedTaskType,
      });
  }

  async sendTaskOpenEvent(categoryId, contentId, taskId) {
    await AnalyticsHelper.sendEvent('3.1.1', 'Content_Clicked', 'Task', 'Content_List', ActionType.CLICK, '', {
        "categoryId":  categoryId,
        "contentId": contentId,
        "taskId": taskId,
      });
  }

  async sendCategoryClickedEvent(categoryId) {
    await AnalyticsHelper.sendEvent('3.2.1', 'Categoy_Filter_Selected', 'Task', 'Category_Filter', ActionType.CLICK, '', {
        "categoryId": categoryId,
      });
  }

  async sendTaskTypeChangeEvent(taskType) {
    await AnalyticsHelper.sendEvent('3.2.2', 'Task_Type_Changed', 'Task', 'Task_Tab', ActionType.CLICK, '', {
        "taskType": taskType,
    });
  }

}