import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNPickerSelect from 'react-native-picker-select';
import { SaveHandler } from '../Handlers/SaveHandler';
import { taskType } from '../Data/TaskData'; // TaskData with taskType array

const { height } = Dimensions.get('window');

// Sample content data for each category
const financeContent = [
  { id: '11', title: 'Finance Tip 1: Budgeting' },
  { id: '12', title: 'Finance Tip 2: Saving' },
  { id: '13', title: 'Finance Tip 3: Investing' },
  { id: '14', title: 'Finance Tip 4: Debt Management' },
];

const focusContent = [
  { id: '21', title: 'Focus Tip 1: Time Management' },
  { id: '22', title: 'Focus Tip 2: Eliminate Distractions' },
  { id: '23', title: 'Focus Tip 3: Goal Setting' },
  { id: '24', title: 'Focus Tip 4: Prioritizing Tasks' },
];

const mindContent = [
  { id: '31', title: 'Mind Tip 1: Meditation' },
  { id: '32', title: 'Mind Tip 2: Journaling' },
  { id: '33', title: 'Mind Tip 3: Self-care Routines' },
  { id: '34', title: 'Mind Tip 4: Stress Management' },
];

const fitContent = [
  { id: '41', title: 'Fit Tip 1: Regular Exercise' },
  { id: '42', title: 'Fit Tip 2: Balanced Diet' },
  { id: '43', title: 'Fit Tip 3: Hydration' },
  { id: '44', title: 'Fit Tip 4: Sleep Well' },
];

const ContentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tileType, categoryId } = route.params;
  const [contentList, setContentList] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<Map<string, boolean>>(new Map());
  const [isModalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState(0); // Default to "All"

  useEffect(() => {
    // Set content list based on tileType
    switch (tileType) {
      case 'Finance':
        setContentList(financeContent);
        break;
      case 'Focus':
        setContentList(focusContent);
        break;
      case 'Mind':
        setContentList(mindContent);
        break;
      case 'Fit':
        setContentList(fitContent);
        break;
      default:
        setContentList([]);
    }
  }, [tileType]);

  useEffect(() => {
    navigation.setOptions({
      title: tileType,
    });

    const loadSavedCards = async () => {
      const savedItems = await SaveHandler.getSaves();
      const savedContentIds = savedItems[categoryId] || [];
      const updatedSavedCards = new Map();
      contentList.forEach((item) => {
        updatedSavedCards.set(item.id, savedContentIds.some((savedCard) => savedCard.contentId === item.id));
      });
      setSavedCards(updatedSavedCards);
    };

    if (contentList.length > 0) {
      loadSavedCards();
    }
  }, [contentList, categoryId, navigation, tileType]);

  const handleSave = async (itemId: string, itemTitle: string) => {
    const isSaved = savedCards.get(itemId);
    if (isSaved) {
      await SaveHandler.removeSave(categoryId, itemId);
      setSavedCards((prev) => new Map(prev).set(itemId, false));
    } else {
      await SaveHandler.addSave(categoryId, itemId, itemTitle);
      setSavedCards((prev) => new Map(prev).set(itemId, true));
    }
  };

  const handleCardPress = (item: { id: string, title: string }) => {
    navigation.navigate('ContentDetailScreen', { itemId: item.id, itemTitle: item.title });
  };

  const handleShare = (itemId: string) => {
    
  };

  const handleAddTask = (itemId: string) => {
    setModalVisible(true);
  };

  const handleSubmitTask = () => {
    if (!taskName.trim() || selectedTaskType === 0) {
      Alert.alert('Error', 'Please enter a task name and select a task type.');
      return;
    }
    console.log(`Task Added: ${taskName}, Type: ${selectedTaskType}`);
    setTaskName('');
    setSelectedTaskType(0); // Reset to default
    setModalVisible(false);
  };

  const taskTypeOptions = taskType.map((type) => ({
    label: type.title,
    value: type.id,
  }));

  return (
    <View style={styles.container}>
      <FlatList
        data={contentList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <TouchableOpacity onPress={() => handleCardPress(item)} style={styles.cardContent}>
              <Text style={styles.contentText}>{item.title}</Text>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleSave(item.id, item.title)}>
                <Ionicons
                  name={savedCards.get(item.id) ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={savedCards.get(item.id) ? 'red' : 'white'}
                />
              </TouchableOpacity>
               
               <TouchableOpacity style={styles.iconButton} onPress={() => handleShare(item.id)}>
                <Ionicons name="share-outline" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={() => handleAddTask(item.id)}>
                <MaterialIcons name="add-task" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        pagingEnabled
        snapToInterval={height * 0.8 + 20}
        snapToAlignment="center"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
      />

      {/* Task Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task name"
              placeholderTextColor="#ccc"
              value={taskName}
              onChangeText={setTaskName}
            />
            <RNPickerSelect
              onValueChange={(value) => setSelectedTaskType(value)}
              items={taskTypeOptions}
              value={selectedTaskType}
              style={pickerStyles}
              placeholder={{ label: 'Select Task Type', value: 0 }}
            />
            <Button title="Add Task" onPress={handleSubmitTask} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cardContainer: {
    height: height * 0.8,
    width: '90%',
    backgroundColor: '#333',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 10,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  iconButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
});

const pickerStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    marginBottom: 20,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    marginBottom: 20,
  },
};

export default ContentScreen;
