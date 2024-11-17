import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RoutineTaskHandler from '../Handlers/RoutineTaskHandler';
import { TaskHandler } from '../Handlers/TaskHandler';

const RoutineTaskScreen = () => {
  const route = useRoute();
  const { task } = route.params; // Get TaskData passed from the previous screen
  const navigation = useNavigation();

  // State for modal and input
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // State for task records
  const [taskRecords, setTaskRecords] = useState([]);

  // Fetch records for the current task ID
  const fetchTaskRecords = async () => {
    try {
      const records = await RoutineTaskHandler.getAllRecordsForTask(task.id);
      setTaskRecords(records);
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
    <View style={styles.recordItem}>
      <Text style={styles.recordText}>{item.message}</Text>
      <Text style={styles.recordDate}>{new Date(item.dateAdded).toLocaleString()}</Text>
    </View>
  );

  // Add custom text to the right of the header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Text style={styles.headerRightText}>Custom Text</Text>,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Rounded corner title */}
      <TouchableOpacity onPress={navigateToContentDetail} style={styles.roundedTitleContainer}>
        <Text style={styles.title}>{task.contentTitle}</Text>
        <Ionicons name="chevron-forward" size={24} color="white" />
      </TouchableOpacity>

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
          <Ionicons name="add-circle" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteTask} style={styles.iconButton}>
          <Ionicons name="checkmark-circle" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteTask} style={styles.iconButton}>
          <Ionicons name="trash-bin" size={30} color="white" />
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
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Record Progress</Text>
            <TextInput
              style={styles.input}
              value={inputValue}
              multiline={true}
              numberOfLines={6}
              onChangeText={setInputValue}
              placeholder="Enter task details"
              placeholderTextColor="#aaa"
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
    padding: 20,
    backgroundColor: '#000',
  },
  roundedTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 8,
    backgroundColor: '#1c1c1c',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordList: {
    marginTop: 20,
  },
  recordItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  recordText: {
    color: '#fff',
    fontSize: 16,
  },
  recordDate: {
    color: 'grey',
    fontSize: 12,
    marginTop: 5,
  },
  emptyText: {
    color: 'grey',
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
    backgroundColor: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1c1c1c',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    height: 80,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  headerRightText: {
    color: 'grey',
    fontSize: 16,
    marginRight: 15,
  },
});

export default RoutineTaskScreen;
