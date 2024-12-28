import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RoutineTaskHandler from '../../Handlers/Tasks/GoalTaskHandler';
import { TaskHandler } from '../../Handlers/Tasks/TaskHandler';
import theme from '../../Theme/Theme';
import GoalTaskHandler from '../../Handlers/Tasks/GoalTaskHandler';
import { TaskDetailAnalytics } from '../../Analytics/TaskDetailAnalytics';
import { TaskProgress } from '../../Data/DataModel';

const GoalTaskScreen = () => {
  const route = useRoute();
  const { task } = route.params; // Get TaskData passed from the previous screen
  const navigation = useNavigation();

  // State for modal and input
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCompleteTaskModalVisible, setIsCompleteTaskModalVisible] = useState(false);
  const [isDeleteTaskModalVisible, setIsDeleteTaskModalVisible] = useState(false);

  const [isDeleteRecordEnable, setIsDeleteRecordEnable] = useState(false);
  const [isDeleteTaskConfirmVisible, setIsDeleteTaskConfirmTaskVisible] = useState(false);


  const [inputValue, setInputValue] = useState('');
  const [progressValue, setProgressValue] = useState(0);
  const [totalProgressValue, setTotalProgress] = useState(0);

  // State for task records
  const [taskRecords, setTaskRecords] = useState([]);
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [isSaveEnable, setIsSaveEnable] = useState(false);

  const [showProgressLimitError, setShowProgressLimitError] = useState(false);
  
  const anlaytics = new TaskDetailAnalytics(task, false)

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
          <TouchableOpacity onPress={openCompleteTaskModal}>
          <Text style={{ color: isTaskCompleted ? theme.colors.green : theme.colors.yellow, fontSize: 20, marginRight: 15, fontWeight: 'bold' }}>
            {isTaskCompleted ? 'Done' : 'In Progress'}
          </Text>
          </TouchableOpacity>
        )
      ),
    });
  }, [isTaskCompleted, isDeleteRecordEnable, navigation]);

  // Fetch records for the current task ID
  const fetchTaskRecords = async () => {
    try {
      const records = await GoalTaskHandler.getAllRecordsForTask(task.id);
      const totalProgress = records.reduce((sum, record) => sum + (parseInt(record.progress, 10) || 0), 0);
      
      setTotalProgress(totalProgress)
      setTaskRecords(records);
      console.log("task records", records)
      setIsTaskCompleted(task.isDone)
      anlaytics.sendRecordListPresentedEvent()
    } catch (error) {
      console.error('Error fetching task records:', error);
    }
  };

  // Load records on component mount and when a new record is added
  useEffect(() => {
    anlaytics.sendTaskDetailImpressionEvent()
    fetchTaskRecords();
  }, []);

  // Handle navigation to ContentDetailScreen
  const navigateToContentDetail = () => {
    anlaytics.sendContentClickeddEvent()
    navigation.navigate('ContentDetailScreen', { content: task.content });
  };

  // Handle opening the modal
  const openModal = () => {
    setIsModalVisible(true);
    anlaytics.sendAddRecordPresentedEvent()
  };

  const openCompleteTaskModal = () => {
    anlaytics.sendChangeTaskStatusPresentedEvent()
    setIsCompleteTaskModalVisible(true);
  };

  const openDeleteTaskModal = () => {
    anlaytics.sendDeleteViewPresentedEvent()
    setIsDeleteTaskModalVisible(true);
  };

  const openDeleteTaskConfirmView = () => {
     setIsDeleteTaskModalVisible(false);
     setIsDeleteTaskConfirmTaskVisible(true)
  }

  const deleteTask = async () => {
    try {
       anlaytics.sendDeleteTaskClickdEvent()
       setIsDeleteTaskModalVisible(false);
       setIsDeleteTaskConfirmTaskVisible(false)
        await RoutineTaskHandler.removeAllRecordsForTask(task.id);
        await TaskHandler.removeTask(task.categoryId,task.id)
        navigation.navigate('HomeTabNavigator', { screen: 'Tasks' });
      } catch (error) {
        console.error('Error saving record:', error);
      }
  };

  const onProgressInputValueChanged = (value) => {
    setProgressValue(parseInt(value));
    const newProgess =  totalProgressValue + parseInt(value)
    const isEnable =  (newProgess < 101)
    setIsSaveEnable(isEnable)
    setShowProgressLimitError(!isEnable)
  };

  // Handle saving a new record
  const handleSave = async () => {
    if (inputValue.trim()) {
      try {
        const recordId =  new Date().getTime().toString()
        const date = new Date().toISOString() 
        const newProgress = new TaskProgress(recordId,task.id,inputValue, progressValue, date)
        await GoalTaskHandler.addRecord(newProgress);


        fetchTaskRecords(); // Refresh the records after saving
        anlaytics.sendAddRecordEvent(recordId)
      } catch (error) {
        console.error('Error saving record:', error);
      }
    } else {
      console.warn('Input value cannot be empty');
    }
    setIsModalVisible(false); // Close the modal
    setInputValue(''); // Clear the input field
    setIsSaveEnable(false)
    setProgressValue(0)
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalVisible(false);
    anlaytics.sendCancelAddRecordEvent()
    setShowProgressLimitError(false)
  };

  const closeCompleteTaskModal = () => {
    anlaytics.sendCancelChangeTaskStatusEvent()
    setIsCompleteTaskModalVisible(false);
  };

  const closeDeleteTaskModal = () => {
    anlaytics.sendCancelDeleteClickdEvent()
    setIsDeleteTaskModalVisible(false);
  };

  const enableDeleteRecord = async () => {
    anlaytics.sendDeleteRecordClickdEvent()
    setIsDeleteRecordEnable(true)
    setIsDeleteTaskModalVisible(false)
  }; 

  const handleDeleteDone = async () => {
    anlaytics.sendDeleteRecordDoneEvent()
    setIsDeleteRecordEnable(false)
  };

  const handleDeleteRecord = async (recordId) => {
    await GoalTaskHandler.removeRecord(recordId)
    anlaytics.sendDeleteRecordEvent(recordId)
    fetchTaskRecords()
  };

  const closeDeleteTaskConfirm = () => {
    //sendCancelChangeTaskStatusEvent()
    setIsDeleteTaskConfirmTaskVisible(false);
  };

  const handleTaskOperation = async () => {
    await TaskHandler.updateTaskState(task.categoryId,task.id, !isTaskCompleted)
    anlaytics.sendChangeTaskStatusEvent(!isTaskCompleted)
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
            <Text style={styles.circleText}>{item.progress}%</Text>
          </View>
        </View>
      </View>
      <View style={styles.recordItem}>
        <Text style={styles.recordText}>{item.message}</Text>
        <Text style={styles.recordDate}>{new Date(item.time).toLocaleString()}</Text>
      </View>
  
      {isDeleteRecordEnable && (
        <TouchableOpacity
          onPress={() => handleDeleteRecord(item.id)}  // Replace with your delete logic
          style={styles.deleteIconContainer}
          accessibilityLabel={'Delete Record'}
        >
          <Ionicons name="close" size={28} color={theme.colors.red} />
        </TouchableOpacity>
      )}
    </View>
  );


  return (
    <View style={styles.container}>
      {/* Rounded corner title */}
      <View style={styles.topHeaderView}>
      <TouchableOpacity onPress={navigateToContentDetail} style={styles.roundedTitleContainer}>
        <Text style={styles.title}>{task.content.title}</Text>
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
            <Text style={styles.leftHeaderText}>Progess</Text>
            <Text style={styles.centerHeaderText}>Message</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No records found</Text>}
      />

      {/* Bottom View with buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={openModal} 
             style={styles.iconButton}
             disabled={isTaskCompleted || isDeleteRecordEnable} 
             accessibilityLabel={'Add new progress'}>
          <Ionicons name="add-outline" size={30} color={(isTaskCompleted || isDeleteRecordEnable) ? theme.colors.greyLight3 : theme.colors.grey} />
          <Text style={[styles.iconButtonText, (isTaskCompleted || isDeleteRecordEnable) && styles.iconButtonTextDisabled]}>Add Record</Text>
        </TouchableOpacity>
       
        <TouchableOpacity onPress={openDeleteTaskModal} 
            style={styles.iconButton}
            disabled={isDeleteRecordEnable}
            accessibilityLabel={'Delete Record Or Task'}>
          <Ionicons name="trash-outline" size={30} color={(isDeleteRecordEnable) ? theme.colors.greyLight3 : theme.colors.grey} />
          <Text style={[styles.iconButtonText, (isDeleteRecordEnable) && styles.iconButtonTextDisabled]}>Delete</Text>
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
        placeholder="Enter Details"
        placeholderTextColor={theme.colors.placeholder}
      />

      <TextInput
              style={styles.progressInput}
              value={progressValue}
              keyboardType="numeric"
              onChangeText={onProgressInputValueChanged}
              placeholder="Enter progress (%)"
              placeholderTextColor="#aaa"
        />
     {showProgressLimitError && (
      <Text style={styles.errorText}>
        Overall Progress cannot be greater than 100%
      </Text>
    )}
      <TouchableOpacity
        onPress={handleSave}
        style={[styles.saveButton, !isSaveEnable && styles.disabledButton]}
        disabled={!isSaveEnable}
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          
          <View style={styles.modalTitleHeader}>
            <Text style={styles.modalTitle}>{!isTaskCompleted ? 'Mark Task Done' : 'Mark Task Undone'}</Text>
           </View>

           <View style={styles.completeTaskOptions}>
           <TouchableOpacity onPress={handleTaskOperation} style={styles.yesButton}>
              <Text style={styles.saveButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeCompleteTaskModal} style={styles.noButton}>
              <Text style={styles.saveButtonText}>No</Text>
            </TouchableOpacity>
           </View>
           
          </View>
        </View>
      </Modal>


      <Modal
        visible={isDeleteTaskConfirmVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDeleteTaskConfirm}
      >
        <View style={styles.modalContainer}
         accessibilityLabel={'Delete Task'}>
          <View style={styles.modalContent}>
          
          <View style={styles.modalTitleHeader}>
            <Text style={styles.modalTitle}>Confirm Delete Task</Text>
           </View>

           <View style={styles.completeTaskOptions}>
           <TouchableOpacity onPress={deleteTask} style={styles.noButton}
            accessibilityLabel={`Confirm Delete Task'}`}>
              <Text style={styles.saveButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeDeleteTaskConfirm} style={styles.yesButton}
             accessibilityLabel={'Close Delete Task View'}>
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
            <TouchableOpacity onPress={openDeleteTaskConfirmView} style={styles.deleteTaskButton}>
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
    borderColor: theme.colors.greyLight2,
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
   // backgroundColor: theme.colors.grey1, // Optional background for the header
  },
  leftHeaderText: {
    textAlign: 'center',
    color: theme.colors.secondaryTheme,
    fontSize: 16,
    fontWeight: '800',
  },
  centerHeaderText: {
    marginLeft: 15,
    flex: 1,
    textAlign: 'left',
    color: theme.colors.secondaryTheme,
    fontSize: 16,
    fontWeight: '800',
  },
  recordList: {
    marginHorizontal: 20,
  },
  recordItem: {
    paddingVertical: 15,
    //borderBottomColor: theme.colors.grey1,
    marginRight: 10,
    //gap: 5
  },
  recordText: {
    color: theme.colors.black,
    textAlign: 'left',
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 70,
  },
  recordDate: {
    color: theme.colors.greyLight3,
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
    borderTopWidth: 2,
    borderTopColor: theme.colors.greyLight2,
  },
  iconButton: {
    padding: 10,
    borderRadius: 50,
    color:   theme.colors.primaryTheme,
    justifyContent: 'center',
    alignItems: 'center'
    //backgroundColor: theme.colors.primaryTheme,
  },
  iconButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: theme.colors.greyLight1,
  },
  iconButtonTextDisabled: {
    color: theme.colors.greyLight3,
  },
  disabledButton: {
    backgroundColor: theme.colors.secondaryThemeDisabled,
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
    backgroundColor: theme.colors.greyLight1,
    color: theme.colors.black,
    height: 80,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.greyLight,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: '500'
  },
  progressInput: {
    backgroundColor: theme.colors.greyLight1,
    borderWidth: 1,
    borderColor: theme.colors.greyLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: theme.colors.red, // Use your theme's red color or a hardcoded hex value like '#FF0000'
    fontSize: 14,
    padding: 10,
    textAlign: 'left',
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: theme.colors.secondaryTheme,
    marginTop: 10,
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
    backgroundColor: theme.colors.blueDisabled,
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
  mainCellView: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  leftCellView: { width: 50, alignItems: 'center', justifyContent: 'center',  },
  lineSuperView: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Ensures vertical alignment
  },
  lineView: {
    width: 1,
    flex: 1,
    backgroundColor: theme.colors.greyDark,
  },
  circleView: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderColor: theme.colors.greyDark,
    borderWidth: 1,
    backgroundColor: theme.colors.white,
    position: 'absolute',
    marginTop: -15,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',
  },
  circleText: {
    color: theme.colors.greyDark, 
    fontSize: 15, 
    fontWeight: 'bold', 
  },
  deleteDoneButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  
});

export default GoalTaskScreen;
