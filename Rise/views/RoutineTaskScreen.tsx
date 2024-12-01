import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RoutineTaskHandler from '../Handlers/RoutineTaskHandler';
import { TaskHandler } from '../Handlers/TaskHandler';
import theme from '../Theme/Theme';

const RoutineTaskScreen = () => {
  const route = useRoute();
  const { task } = route.params; // Get TaskData passed from the previous screen
  const navigation = useNavigation();

  // State for modal and input
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // State for task records
  const [taskRecords, setTaskRecords] = useState([]);
  const [frequencyType, setFrequencyType] = useState('Days');

  // Fetch records for the current task ID
  const fetchTaskRecords = async () => {
    try {
      const records = await RoutineTaskHandler.getAllRecordsForTask(task.id);
      const recordsWithNumbers = records.map((record, index) => ({
        ...record,
        no: index + 1, 
      }));
  
      setTaskRecords(recordsWithNumbers);
      console.log("Record Type: {re}")

      if (task.subType == 1) {
        setFrequencyType('Days')
      } else if (task.subType == 2) {
        setFrequencyType('Weeks')
      } else {
        setFrequencyType('Months')
      }

    } catch (error) {
      console.error('Error fetching task records:', error);
    }
  };

  // Load records on component mount and when a new record is added
  useEffect(() => {
    fetchTaskRecords();
  }, []);

  // Handle navigation to ContentDetailScreen
  const navigateToContentDetail = () => {
    navigation.navigate('ContentDetailScreen', { itemId: task.contentId, itemTitle: task.contentTitle });
  };

  // Handle opening the modal
  const openModal = () => {
    setIsModalVisible(true);
  };

  const deleteTask = async () => {
    try {
        await RoutineTaskHandler.removeAllRecordsForTask(task.id);
        await TaskHandler.removeTask(task.categoryId,task.id)
        console.log('All Records saved successfully');
        navigation.popToTop();
      } catch (error) {
        console.error('Error saving record:', error);
      }
  };


  // Handle saving a new record
  const handleSave = async () => {
    if (inputValue.trim()) {
      try {
        await RoutineTaskHandler.addRecord(task.id, inputValue);
        console.log('Record saved successfully');
        fetchTaskRecords(); // Refresh the records after saving
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
  };

  // Render a single record in the FlatList
  const renderRecordItem = ({ item }) => (
    <View style={styles.mainCellView}>
      <View style={styles.leftCellView}>
        <View style={styles.lineSuperView}>
          <View style={styles.lineView}></View>
          <View style={styles.circleView}>
            <Text style={styles.circleText}>{item.no}</Text> {/* Add desired text here */}
          </View>
        </View>
      </View>
      <View style={styles.recordItem}>
        <Text style={styles.recordText}>{item.message}</Text>
        <Text style={styles.recordDate}>{new Date(item.dateAdded).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Rounded corner title */}
      <View style={styles.topHeaderView}>
      <TouchableOpacity onPress={navigateToContentDetail} style={styles.roundedTitleContainer}>
        <Text style={styles.title}>{task.contentTitle}</Text>
        <Ionicons name="chevron-forward" size={24} color={theme.colors.grey1} />
      </TouchableOpacity>
      </View>

      <View style={styles.recordHeaderView}>
        <Text style={styles.recordHeaderFrequecy} > {frequencyType} </Text>
        <Text style={styles.recordHeaderMessage}> Message </Text>
      </View>
      

      {/* FlatList to display task records */}
      <FlatList
        data={taskRecords}
        keyExtractor={(item) => item.recordId}
        renderItem={renderRecordItem}
        style={styles.recordList}
        ListEmptyComponent={<Text style={styles.emptyText}>No records found</Text>}
      />

      {/* Bottom View with buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={openModal} style={styles.iconButton}>
          <Ionicons name="add-circle" size={30} color={theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteTask} style={styles.iconButton}>
          <Ionicons name="checkmark-circle" size={30} color={theme.colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteTask} style={styles.iconButton}>
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
            <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Progress</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.grey1} />
            </TouchableOpacity>
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
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
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
    color: theme.colors.black,
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordHeaderView: {
    flexDirection: 'row',
    marginTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  recordHeaderFrequecy: {
    width: 50,
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  recordHeaderMessage: {
    color: theme.colors.primary,
    fontSize: 12,
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
  modalHeader: {
    height: 40,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: theme.colors.black,
    fontSize: 18,
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
    backgroundColor: theme.colors.green,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
  },
  closeButton: {
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
  
});

export default RoutineTaskScreen;
