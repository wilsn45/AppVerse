import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class TaskDetailAnalytics {

  task;
 idPrefix = 7
 taskType = "Routine_Task"

  // Constructor to accept and save the argument
  constructor(task, isRoutineTask) {
    this.task = task;
    this.idPrefix = isRoutineTask ? 6 : 7; 
    this.taskType = isRoutineTask ? "Routine_Task" : "Goal_Task"; 
  }

 async sendTaskDetailImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.0.0`,
        'Routine_Task_Appeared',
        this.taskType,
        '',
        ActionType.IMPRESSION,
        '',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id }
      );
  }

  async sendRecordListPresentedEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.1.0`,
        'Record_List_Presented',
        this.taskType,
        'Record_List',
        ActionType.IMPRESSION,
        '',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id }
      );
  }

  async sendAddRecordPresentedEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.2.0`,
        'Add_Recod_Presented',
        this.taskType,
        'Add_Record',
        ActionType.IMPRESSION,
        '',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id }
      );
  }

  async sendAddRecordEvent(recordId) {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.2.1.1`,
       'Add_New_Record',
        this.taskType,
        'Add_Record',
        ActionType.CLICK,
        'Add',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id, 'recordId': recordId }
      );
  }

  async sendCancelAddRecordEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.2.1.2`,
        'Cancel_Add_New_Record',
        this.taskType,
        'Add_Record',
        ActionType.CLICK,
        'Cancel',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id }
      );
  }

  async sendChangeTaskStatusPresentedEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.3.0`,
        'Change_Task_Status_Presented',
        this.taskType,
        'Change_Task_Status',
        ActionType.IMPRESSION,
        '',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id }
      );
  }

  async sendChangeTaskStatusEvent(isCompleted) {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.3.0`,
        'Change_Task_Status',
        this.taskType,
        'Change_Task_Status',
        ActionType.CLICK,
        'Change',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id, 'isCompleted': isCompleted }
      );
  }

  async sendCancelChangeTaskStatusEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.3.1.2`,
        'Cancel_Change_Task_Status',
        this.taskType,
        'Change_Task_Status',
        ActionType.CLICK,
        'Cancel',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id}
      );
  }

  async sendDeleteViewPresentedEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.4.0`,
        'Delete_View_Presented',
        this.taskType,
        'Delete_View',
        ActionType.IMPRESSION,
        '',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id}
      );
  }

  async sendDeleteRecordClickdEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.4.1.1`,
        'Delete_Record_Clicked',
        this.taskType,
        'Delete_View',
        ActionType.CLICK,
       'Record',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id}
      );
  }

  async sendDeleteTaskClickdEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.4.1.2`,
        'Delete_Record_Clicked',
        this.taskType,
        'Delete_View',
        ActionType.CLICK,
       'Task',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id}
      );
  }

  async sendCancelDeleteClickdEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.4.1.3`,
        'Cancel_Delete_Clicked',
        this.taskType,
        'Delete_View',
        ActionType.CLICK,
        'Cancel',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id}
      );
  }

  async sendDeleteRecordEvent(recodId) {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.5.1.1`,
        'Delete_Record',
        this.taskType,
       'Delete_Record',
        ActionType.CLICK,
       'Delete',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id, 'recodId': recodId}
      );
  }

  async sendDeleteRecordDoneEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.5.1.2`,
       'Delete_Record_Done',
        this.taskType,
       'Delete_Record',
        ActionType.CLICK,
       'Done',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id}
      );
  }

  async sendContentClickeddEvent() {
    await AnalyticsHelper.sendEvent(
        `${this.idPrefix}.6.1`,
       'Contetn_Clicked',
        this.taskType,
        'Content_View',
        ActionType.IMPRESSION,
       '',
        {'categoryId': this.task.categoryId, 'contentId' : this.task.contentId, 'taskId': this.task.id}
      );
  }

}