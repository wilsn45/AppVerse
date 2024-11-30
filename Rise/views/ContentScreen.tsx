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
import Slider from '@react-native-community/slider';
import { SaveHandler } from '../Handlers/SaveHandler';
import { TaskHandler } from '../Handlers/TaskHandler';
import theme from '../Theme/Theme';

const { height } = Dimensions.get('window');

// Sample content data for each category
const financeContent = [
  { id: '11', title: 'Finance Tip 1: Budgeting' },
  { id: '12', title: 'Finance Tip 2: Saving A very very very very very very longggggggggggg Saving sabinnnnggg savnnggggggg savingggggggg' },
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
  const [selectedContentid, setSelectedContendid] = useState(""); // Default to "Routine"
  const [selectedTaskType, setSelectedTaskType] = useState(0); // 0 for Routine, 1 for Goal
  const [selectedSubTaskType, setSelectedSubTaskType] = useState(0); // 0 for Daily, 1 for Weekly, 2 for Monthly


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

  const handleTaskTypeChange = (value: number) => {
    setSelectedTaskType(value);
  };

  const handleShare = (itemId: string) => {
    
  };

  const handleCardPress = (item: { id: string, title: string }) => {
    navigation.navigate('ContentDetailScreen', { itemId: item.id, itemTitle: item.title });
  };

  const handleAddTask = (itemId: string) => {
    setSelectedContendid(itemId)
    setModalVisible(true);
  };

  const handleCancelAddTask = async () => { 
      setTaskName(''); // Clear task name input
      setSelectedTaskType(0); // Reset task type to default
      setModalVisible(false); // Close the modal
  }

  const handleSubmitTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }
  
    try {
      // Call the addTask method from TaskHandler to save the task
      const content = contentList.find((item) => item.id === selectedContentid) ;
      const contentTitle  = content ? content.title : '';

      await TaskHandler.addTask(taskName, selectedTaskType,selectedSubTaskType, selectedContentid,contentTitle, categoryId);
  
      // Log the task details to console (for debugging purposes)
      console.log(`Task Added contentTitle: ${contentTitle}`)
      console.log(`Task Added: ${taskName}, Type: ${selectedTaskType}, Category: ${categoryId}, ContentId: ${selectedContentid}`);
  
      setTaskName(''); 
      setSelectedSubTaskType(0)
      setSelectedTaskType(0); 
      setModalVisible(false); 
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert('Error', 'Something went wrong while adding the task.');
    }
  };

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
                  color={savedCards.get(item.id) ? theme.colors.red : theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleShare(item.id)}>
                <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleAddTask(item.id)}>
                <MaterialIcons name="add-task" size={24} color={theme.colors.primary}/>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Task Modal */}
    {/* Task Modal */}
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

      {/* Routine and Goal Buttons */}
      <View style={styles.optionButtonContainer}>
        <TouchableOpacity
          style={[styles.optionButton, selectedTaskType === 0 && styles.selectedButton]}
          onPress={() => setSelectedTaskType(0)} // 0 for Routine
        >
          <Text style={[styles.optionButtonText, selectedTaskType === 0 && styles.selectedOptionButtonText]}>Routine</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, selectedTaskType === 1 && styles.selectedButton]}
          onPress={() => setSelectedTaskType(1)} // 0 for Routine
        >
          <Text style={[styles.optionButtonText, selectedTaskType === 1 && styles.selectedOptionButtonText]}>Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Sub-buttons for Routine */}
      {selectedTaskType === 0 && (
        <View style={styles.subButtonContainer}>
          {[0, 1, 2].map((value, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedSubTaskType === value && styles.selectedButton,
              ]}
              onPress={() => setSelectedSubTaskType(value)}
            >
              <Text style={[
                styles.optionButtonText,
                selectedSubTaskType === value && styles.selectedOptionButtonText,
              ]}>
                {value === 0 ? 'Daily' : value === 1 ? 'Weekly' : 'Monthly'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Add Task and Cancel Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Add Task" onPress={handleSubmitTask} />
        <Button title="Cancel" color="red" onPress={handleCancelAddTask} />
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
  cardContainer: {
    height: height * 0.8,
    width: '90%',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.grey2,
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
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 10,
  },
  iconButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
  optionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 5,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.grey2,
    backgroundColor: theme.colors.white
  },
  selectedButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.grey2,
  },
  optionButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  selectedOptionButtonText: {
    color: theme.colors.white,
  },
  subButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 20,
  },
  addTaskButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: theme.colors.white
  },
});

export default ContentScreen;
