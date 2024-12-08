import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RoutineTaskHandler from '../../Handlers/Tasks/RoutineTaskHandler';
import { TaskHandler } from '../../Handlers/Tasks/TaskHandler';
import theme from '../../Theme/Theme';
import { AnalyticsHelper, ActionType } from '../../Analytics/AnalyticsHelper';

const RoutineTaskScreen = () => {
  const route = useRoute();
  const { task } = route.params; // Get TaskData passed from the previous screen
  const navigation = useNavigation();

  // State for modal and input
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCompleteTaskModalVisible, setIsCompleteTaskModalVisible] = useState(false);

  const [isDeleteTaskModalVisible, setIsDeleteTaskModalVisible] = useState(false);
  const [isDeleteRecordEnable, setIsDeleteRecordEnable] = useState(false);


  const [inputValue, setInputValue] = useState('');

  // State for task records
  const [taskRecords, setTaskRecords] = useState([]);
  const [frequencyType, setFrequencyType] = useState('Days');
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        isDeleteRecordEnable ? (
          <TouchableOpacity onPress={handleDeleteDone} style={styles.deleteDoneButton}
          accessibilityLabel={'Finish Record Delete'}>
            <Text style={{ color: theme.colors.primary, fontSize: 24, fontWeight: 'bold', marginRight: 10 }}>
              Done
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ color: isTaskCompleted ? theme.colors.green : theme.colors.yellow, fontSize: 20, marginRight: 15, fontWeight: 'bold' }}>
            {isTaskCompleted ? 'Done' : 'In Progress'}
          </Text>
        )
      ),
    });
  }, [isTaskCompleted, isDeleteRecordEnable, navigation]);

  // Fetch records for the current task ID
  const fetchTaskRecords = async () => {
    try {
      const records = await RoutineTaskHandler.getAllRecordsForTask(task.id);
      const recordsWithNumbers = records.map((record, index) => ({
        ...record,
        no: index + 1, 
      }));
  
      setTaskRecords(recordsWithNumbers);
      sendRecordListPresentedEvent()

      if (task.subType == 1) {
        setFrequencyType('Days')
      } else if (task.subType == 2) {
        setFrequencyType('Weeks')
      } else {
        setFrequencyType('Months')
      }
      setIsTaskCompleted(task.isDone)

    } catch (error) {
      console.error('Error fetching task records:', error);
    }
  };

  // Load records on component mount and when a new record is added
  useEffect(() => {
    sendRoutineTaskImpressionEvent()
    fetchTaskRecords();
  }, []);

  // Handle navigation to ContentDetailScreen
  const navigateToContentDetail = () => {
    sendContentClickeddEvent()
    navigation.navigate('ContentDetailScreen', { itemId: task.contentId, itemTitle: task.contentTitle, categoryId:  task.categoryId });
  };

  // Handle opening the modal
  const openModal = () => {
    setIsModalVisible(true);
    sendAddRecordPresentedEvent()
  };

  const openCompleteTaskModal = () => {
    sendChangeTaskStatusPresentedEvent()
    setIsCompleteTaskModalVisible(true);
  };

  const openDeleteTaskModal = () => {
    sendDeleteViewPresentedEvent()
    setIsDeleteTaskModalVisible(true);
  };

  const deleteTask = async () => {
    try {
         sendDeleteTaskClickdEvent()
         setIsDeleteTaskModalVisible(false);
        await RoutineTaskHandler.removeAllRecordsForTask(task.id);
        await TaskHandler.removeTask(task.categoryId,task.id)
        navigation.navigate('HomeTabNavigator', { screen: 'Tasks' });
      } catch (error) {
        console.error('Error saving record:', error);
      }
  };

  // Handle saving a new record
  const handleSave = async () => {
    if (inputValue.trim()) {
      try {
        const recordId =  new Date().getTime().toString()
        await RoutineTaskHandler.addRecord(task.id, inputValue,recordId);
        console.log('Record saved successfully');
        fetchTaskRecords(); // Refresh the records after saving
        sendAddRecordEvent(recordId)
      } catch (error) {
        console.error('Error saving record:', error);
      }
    } else {
      console.warn('Input value cannot be empty');
    }
    setIsModalVisible(false); // Close the modal
    setInputValue(''); // Clear the input field
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalVisible(false);
    sendCancelAddRecordEvent()
  };

  const closeCompleteTaskModal = () => {
    sendCancelChangeTaskStatusEvent()
    setIsCompleteTaskModalVisible(false);
  };

  const closeDeleteTaskModal = () => {
    sendCancelDeleteClickdEvent()
    setIsDeleteTaskModalVisible(false);
  };


  const enableDeleteRecord = async () => {
    sendDeleteRecordClickdEvent()
    setIsDeleteRecordEnable(true)
    setIsDeleteTaskModalVisible(false)
  }; 

  const handleDeleteDone = async () => {
    sendDeleteRecordDoneEvent()
    setIsDeleteRecordEnable(false)
  };

  const handleDeleteRecord = async (recordId) => {
    await RoutineTaskHandler.removeRecord(recordId)
    sendDeleteRecordEvent(recordId)
    fetchTaskRecords()
  };

  const handleTaskOperation = async () => {
    await TaskHandler.updateTaskState(task.categoryId,task.id, !isTaskCompleted)
    sendChangeTaskStatusEvent(!isTaskCompleted)
    setIsTaskCompleted(!isTaskCompleted)
    setIsCompleteTaskModalVisible(false); 
  };

  // Render a single record in the FlatList
  const renderRecordItem = ({ item }) => (
    <View style={styles.mainCellView}>
      <View style={styles.leftCellView}>
        <View style={styles.lineSuperView}>
          <View style={styles.lineView}></View>
          <View style={styles.circleView}>
            <Text style={styles.circleText}>{item.no}</Text> 
          </View>
        </View>
      </View>
      <View style={styles.recordItem}>
        <Text style={styles.recordText}>{item.message}</Text>
        <Text style={styles.recordDate}>{new Date(item.dateAdded).toLocaleString()}</Text>
      </View>
      {isDeleteRecordEnable && (
        <TouchableOpacity
          onPress={() => handleDeleteRecord(item.recordId)}  // Replace with your delete logic
          style={styles.deleteIconContainer}
          accessibilityLabel={'Delete Record'}
        >
          <Ionicons name="close" size={28} color={theme.colors.red} />
        </TouchableOpacity>
      )}
    </View>
  );


  //ANalytics Events
  const sendRoutineTaskImpressionEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.0.0',
      'Routine_Task_Appeared',
      'Routine_Task',
      '',
      ActionType.IMPRESSION,
      '',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id }
    );
  };

  const sendRecordListPresentedEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.1.0',
      'Record_List_Presented',
      'Routine_Task',
      'Record_List',
      ActionType.IMPRESSION,
      '',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id }
    );
  };

  const sendAddRecordPresentedEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.2.0',
      'Add_Recod_Presented',
      'Routine_Task',
      'Add_Record',
      ActionType.IMPRESSION,
      '',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id }
    );
  };

  const sendAddRecordEvent = async (recordId: string) => {
    await AnalyticsHelper.sendEvent(
      '6.2.1.1',
      'Add_New_Record',
      'Routine_Task',
      'Add_Record',
      ActionType.CLICK,
      'Add',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id, 'recordId': recordId}
    );
  };

  const sendCancelAddRecordEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.2.1.2',
      'Cancel_Add_New_Record',
      'Routine_Task',
      'Add_Record',
      ActionType.CLICK,
      'Cancel',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id}
    );
  };

  const sendChangeTaskStatusPresentedEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.3.0',
      'Change_Task_Status_Presented',
      'Routine_Task',
      'Change_Task_Status',
      ActionType.IMPRESSION,
      '',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id}
    );
  };

  const sendChangeTaskStatusEvent = async (isCompleted) => {
    await AnalyticsHelper.sendEvent(
      '6.3.1.1',
      'Change_Task_Status',
      'Routine_Task',
      'Change_Task_Status',
      ActionType.CLICK,
      'Change',
      {'categoryId': task.categoryId, 'contentId' : task.contentId,'taskId': task.id, 'isDone': isCompleted}
    );
  };

  const sendCancelChangeTaskStatusEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.3.1.2',
      'Cancel_Change_Task_Status',
      'Routine_Task',
      'Change_Task_Status',
      ActionType.CLICK,
      'Cancel',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id}
    );
  };

  const sendDeleteViewPresentedEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.4.0',
      'Delete_View_Presented',
      'Routine_Task',
      'Delete_View',
      ActionType.IMPRESSION,
      '',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id}
    );
  };

  const sendDeleteRecordClickdEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.4.1.1',
      'Delete_Record_Clicked',
      'Routine_Task',
      'Delete_View',
      ActionType.CLICK,
      'Record',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id}
    );
  };

  const sendDeleteTaskClickdEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.4.1.2',
      'Delete_Task_Clicked',
      'Routine_Task',
      'Delete_View',
      ActionType.CLICK,
      'Task',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id}
    );
  };

  const sendCancelDeleteClickdEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.4.1.3',
      'Cancel_Delete_Clicked',
      'Routine_Task',
      'Delete_View',
      ActionType.CLICK,
      'Cancel',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id}
    );
  };

  const sendDeleteRecordEvent = async (recodId: string) => {
    await AnalyticsHelper.sendEvent(
      '6.5.1.1',
      'Delete_Record',
      'Routine_Task',
      'Delete_Record',
      ActionType.CLICK,
      'Delete',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id, 'recordId': recodId}
    );
  };

  const sendDeleteRecordDoneEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.5.1.2',
      'Delete_Record_Done',
      'Routine_Task',
      'Delete_Record',
      ActionType.CLICK,
      'Done',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id}
    );
  };


  const sendContentClickeddEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '6.6.1',
      'Contetn_Clicked',
      'Routine_Task',
      'Content_View',
      ActionType.IMPRESSION,
      '',
      {'categoryId': task.categoryId, 'contentId' : task.contentId, 'taskId': task.id }
    );
  };


  return (
    <View style={styles.container}>
      {/* Rounded corner title */}
      <View style={styles.topHeaderView}>
      <TouchableOpacity onPress={navigateToContentDetail} style={styles.roundedTitleContainer}>
        <Text style={styles.title}>{task.contentTitle}</Text>
        <Ionicons name="chevron-forward" size={24} color={theme.colors.grey1} />
      </TouchableOpacity>
      </View>

      {/* FlatList to display task records */}
      <FlatList
        data={taskRecords}
        keyExtractor={(item) => item.recordId}
        renderItem={renderRecordItem}
        style={styles.recordList}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.leftHeaderText}>{frequencyType}</Text>
            <Text style={styles.centerHeaderText}>Message</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No records found</Text>}
      />

      {/* Bottom View with buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={openModal} 
             style={[styles.iconButton, (isTaskCompleted || isDeleteRecordEnable) && styles.disabledButton]}
             disabled={isTaskCompleted || isDeleteRecordEnable} 
             accessibilityLabel={'Add new progress'}>
          <Ionicons name="add-circle" size={30} color={theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openCompleteTaskModal} 
        style={[styles.iconButton, isDeleteRecordEnable && styles.disabledButton]}
        disabled={isDeleteRecordEnable}
        accessibilityLabel={`Mark Task ${isTaskCompleted ? 'Incompelete': 'Complete'}`}>
          <Ionicons name="checkmark-circle" size={30} color={theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openDeleteTaskModal} 
            style={[styles.iconButton, isDeleteRecordEnable && styles.disabledButton]}
            disabled={isDeleteRecordEnable}
            accessibilityLabel={'Delete Record Or Task'}>
          <Ionicons name="trash-bin" size={30} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Modal for Add Task */}
      <Modal
  visible={isModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={closeModal}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <View style={styles.modalTopHeader}>
        <TouchableOpacity onPress={closeModal}
        accessibilityLabel={'Cancel add new progress'}>
          <Ionicons name="close" size={24} color={theme.colors.grey1} />
        </TouchableOpacity>
      </View>
      <View style={styles.modalTitleHeader}>
        <Text style={styles.modalTitle}>Record Progress</Text>
      </View>
      <TextInput
        style={styles.input}
        value={inputValue}
        multiline={true}
        numberOfLines={6}
        onChangeText={setInputValue}
        placeholder="Enter progress"
        placeholderTextColor={theme.colors.placeholder}
      />
      <TouchableOpacity
        onPress={handleSave}
        style={[styles.saveButton, inputValue.trim() === '' && styles.disabledButton]}
        disabled={inputValue.trim() === ''}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      <Modal
        visible={isCompleteTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeCompleteTaskModal}
      >
        <View style={styles.modalContainer}
         accessibilityLabel={'Change Task Status'}>
          <View style={styles.modalContent}>
          
          <View style={styles.modalTitleHeader}>
            <Text style={styles.modalTitle}>{!isTaskCompleted ? 'Mark Task Done' : 'Mark Task Undone'}</Text>
           </View>

           <View style={styles.completeTaskOptions}>
           <TouchableOpacity onPress={handleTaskOperation} style={styles.yesButton}
            accessibilityLabel={`Mark Task ${isTaskCompleted ? 'Incompelete': 'Complete'}`}>
              <Text style={styles.saveButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeCompleteTaskModal} style={styles.noButton}
             accessibilityLabel={'Cancel Change Task Status'}>
              <Text style={styles.saveButtonText}>No</Text>
            </TouchableOpacity>
           </View>
           
          </View>
        </View>
      </Modal>


      <Modal
        visible={isDeleteTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDeleteTaskModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          
          <View style={styles.modalTopHeader}>
           <TouchableOpacity onPress={closeDeleteTaskModal}
            accessibilityLabel={'Cancel Delete'}>
                 <Ionicons name="close" size={24} color={theme.colors.grey1} />
            </TouchableOpacity>
          </View>

           <View style={styles.completeTaskOptions}>
           <TouchableOpacity
              onPress={enableDeleteRecord}
              style={[
                 styles.deleteRecordButton, 
                    taskRecords.length === 0 && styles.deleteRecordButtonDisable
                ]}
                 disabled={taskRecords.length === 0}
                >
              <Text style={styles.deleteButtonText}>Delete Records</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deleteTask} style={styles.deleteTaskButton}>
              <Text style={styles.deleteButtonText}>Delete Task</Text>
            </TouchableOpacity>
           </View>
           
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  topHeaderView: {
    padding: 20,
  },
  roundedTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.grey2,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
  },
  title: {
    flex: 0.95,
    color: theme.colors.black,
    fontSize: 18,
    fontWeight: 'bold',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 10,
    backgroundColor: theme.colors.grey1, // Optional background for the header
  },
  leftHeaderText: {
    textAlign: 'center',
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerHeaderText: {
    marginLeft: 10,
    flex: 1,
    textAlign: 'left',
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordList: {
    paddingHorizontal: 20,
  },
  recordItem: {
    paddingVertical: 15,
    borderBottomColor: theme.colors.grey1,
    paddingRight: 15,
  },
  recordText: {
    color: theme.colors.black,
    fontSize: 16,
    paddingRight: 15,
    
  },
  recordDate: {
    color: theme.colors.grey1,
    fontSize: 12,
    marginTop: 5,
  },
  deleteIconContainer: {
    position: 'absolute',
    right: 10,  // Adjust the right spacing if needed
    top: '50%',  // Vertically center
    transform: [{ translateY: -12 }],  // Adjust for exact vertical centering
  },
  emptyText: {
    color: theme.colors.grey1,
    textAlign: 'center',
    marginTop: 20,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
  },
  iconButton: {
    padding: 10,
    borderRadius: 50,
    color:   theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: theme.colors.primaryDisabled,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    padding: 20,
    borderRadius: 8,
    width: '80%',
    paddingBottom: 15
  },
  modalTopHeader: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalTitleHeader: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  modalTitle: {
    color: theme.colors.black,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.grey1,
    color: theme.colors.black,
    height: 80,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.grey2,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
  },
  yesButton:  {
    backgroundColor: theme.colors.green,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: 70
  },
  noButton: {
    backgroundColor: theme.colors.red,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: 70
  },

  deleteRecordButton:  {
    backgroundColor: theme.colors.primary,
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteRecordButtonDisable: {
    backgroundColor: theme.colors.primaryDisabled,
  },
 deleteTaskButton: {
    backgroundColor: theme.colors.red,
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold'
  },
  completeTaskOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20
  },
  headerRightText: {
    color: 'grey',
    fontSize: 16,
    marginRight: 15,
  },
  mainCellView: { flexDirection: 'row', gap: 15 },
  leftCellView: { width: 50, alignItems: 'center', justifyContent: 'center',  },
  lineSuperView: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Ensures vertical alignment
  },
  lineView: {
    width: 5,
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  circleView: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderColor: theme.colors.grey2,
    borderWidth: 1,
    backgroundColor: theme.colors.white,
    position: 'absolute',
    marginTop: -15,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',
  },
  circleText: {
    color: theme.colors.black, 
    fontSize: 14, 
    fontWeight: 'bold', 
  },
  deleteDoneButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  
});

export default RoutineTaskScreen;
