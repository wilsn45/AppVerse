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
import { LikeHandler } from '../Handlers/LikeHandler.tsx';
import { TaskHandler } from '../Handlers/TaskHandler';
import theme from '../Theme/Theme';

const { height } = Dimensions.get('window');

// Sample content data for each category
const financeContent = [
  { id: '11', title: 'Finance Tip 1: Budgeting', like: 10 },
  { id: '12', title: 'Finance Tip 2: Saving A very very very very very very longggggggggggg Saving sabinnnnggg savnnggggggg savingggggggg', like: 11 },
  { id: '13', title: 'Finance Tip 3: Investing', like: 12 },
  { id: '14', title: 'Finance Tip 4: Debt Management', like: 13 },
];

const focusContent = [
  { id: '21', title: 'Focus Tip 1: Time Management', like: 20 },
  { id: '22', title: 'Focus Tip 2: Eliminate Distractions', like: 21 },
  { id: '23', title: 'Focus Tip 3: Goal Setting', like: 22 },
  { id: '24', title: 'Focus Tip 4: Prioritizing Tasks', like: 23 },
];

const mindContent = [
  { id: '31', title: 'Mind Tip 1: Meditation' , like: 30},
  { id: '32', title: 'Mind Tip 2: Journaling', like: 31 },
  { id: '33', title: 'Mind Tip 3: Self-care Routines', like: 32 },
  { id: '34', title: 'Mind Tip 4: Stress Management', like: 33 },
];

const fitContent = [
  { id: '41', title: 'Fit Tip 1: Regular Exercise', like: 40 },
  { id: '42', title: 'Fit Tip 2: Balanced Diet' , like: 41},
  { id: '43', title: 'Fit Tip 3: Hydration', like: 42 },
  { id: '44', title: 'Fit Tip 4: Sleep Well', like: 43 },
];

const ContentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tileType, categoryId } = route.params;
  const [contentList, setContentList] = useState<any[]>([]);
  const [savedCards, setSavedCards] = useState<Map<string, boolean>>(new Map());
  const [likedCards, setLikedCards] = useState<Map<string, boolean>>(new Map());
  const [isModalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedContentid, setSelectedContendid] = useState(""); // Default to "Routine"
  const [selectedTaskType, setSelectedTaskType] = useState(1); // 0 for Routine, 1 for Goal
  const [selectedSubTaskType, setSelectedSubTaskType] = useState(1); // 0 for Daily, 1 for Weekly, 2 for Monthly


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
  
    const loadCards = async () => {
      const savedItemsPromise = SaveHandler.getSaves();
      const likedItemsPromise = LikeHandler.getLikes();
  
      const [savedItems, likedItems] = await Promise.all([savedItemsPromise, likedItemsPromise]);
  
      const savedContentIds = savedItems[categoryId] || [];
      const likedContentIds = likedItems[categoryId] || [];
  
      const updatedSavedCards = new Map();
      const updatedLikedCards = new Map();
  
      contentList.forEach((item) => {
        updatedSavedCards.set(item.id, savedContentIds.some((savedCard) => savedCard.contentId === item.id));
        updatedLikedCards.set(item.id, likedContentIds.some((likedCard) => likedCard.contentId === item.id));
      });
  
      setSavedCards(updatedSavedCards);
      setLikedCards(updatedLikedCards);
    };
  
    if (contentList.length > 0) {
      loadCards();
    }
  }, [contentList, categoryId, navigation, tileType]);
  

  const handleSave = async (itemId, itemTitle) => {
    const isSaved = savedCards.get(itemId);
    if (isSaved) {
      await SaveHandler.removeSave(categoryId, itemId);
    } else {
      await SaveHandler.addSave(categoryId, itemId, itemTitle);
    }
    // Update only the savedCards state here
    setSavedCards((prev) => new Map(prev).set(itemId, !isSaved));
  };
  
  const handleLike = async (itemId, itemTitle) => {
    const isLiked = likedCards.get(itemId);
    if (isLiked) {
      await LikeHandler.removeLike(categoryId, itemId);
      dencreaseLikeCount(itemId)
    } else {
      await LikeHandler.addLike(categoryId, itemId, itemTitle);
      increaseLikeCount(itemId)
    }
    // Update only the likedCards state here
    setLikedCards((prev) => new Map(prev).set(itemId, !isLiked));
    
  };

  const increaseLikeCount = (id) => {
    setContentList((prevContentList) => {
      return prevContentList.map(item => {
        if (item.id === id) {
          return { ...item, like: item.like + 1 };
        }
        return item;
      });
    });
  };

  const dencreaseLikeCount = (id) => {
    setContentList((prevContentList) => {
      return prevContentList.map(item => {
        if (item.id === id) {
          return { ...item, like: item.like - 1 };
        }
        return item;
      });
    });
  };

  const handleCardPress = (item: { id: string, title: string }) => {
    navigation.navigate('ContentDetailScreen', { itemId: item.id, itemTitle: item.title });
  };

  const handleAddTask = (itemId: string) => {
    setSelectedContendid(itemId)
    setModalVisible(true);
  };

  const handleCancelAddTask = async () => { 
      setTaskName(''); 
      setSelectedSubTaskType(1)
      setSelectedTaskType(1); 
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
      setSelectedSubTaskType(1)
      setSelectedTaskType(1); 
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
                  color={savedCards.get(item.id) ? theme.colors.green : theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButtonLike} onPress={() => handleLike(item.id, item.title)}>
                <Ionicons
                  name={likedCards.get(item.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={likedCards.get(item.id) ? theme.colors.red : theme.colors.primary}
                />
                <Text>{item.like}</Text>
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
          
          {/* Task Input */}
          <TextInput
            style={styles.input}
            placeholder="Enter task name"
            placeholderTextColor={theme.colors.placeholder}
            value={taskName}
            onChangeText={setTaskName}
          />

          {/* Routine and Goal Buttons */}
          <View style={styles.optionButtonContainer}>
            <TouchableOpacity
              style={[styles.optionButton, selectedTaskType === 1 && styles.selectedButton]}
              onPress={() => setSelectedTaskType(1)} // 0 for Routine
            >
              <Text style={[styles.optionButtonText, selectedTaskType === 1 && styles.selectedOptionButtonText]}>
                Routine
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, selectedTaskType === 2 && styles.selectedButton]}
              onPress={() => setSelectedTaskType(2)} // 1 for Goal
            >
              <Text style={[styles.optionButtonText, selectedTaskType === 2 && styles.selectedOptionButtonText]}>
                Goal
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sub-buttons for Routine */}
          {selectedTaskType === 1 && (
            <View style={styles.subButtonContainer}>
              {[1, 2, 3].map((value, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.subOptionButton,
                    selectedSubTaskType === value && styles.subSelectedButton,
                  ]}
                  onPress={() => setSelectedSubTaskType(value)}
                >
                  <Text style={[
                    styles.subOptionButtonText,
                    selectedSubTaskType === value && styles.subSelectedOptionButtonText,
                  ]}>
                    {value === 1 ? 'Daily' : value === 2 ? 'Weekly' : 'Monthly'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Add Task and Cancel Buttons */}
          <View style={styles.addTaskbuttonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleSubmitTask}>
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelAddTask}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    backgroundColor: theme.colors.background,
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
  iconButtonLike: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
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
    borderColor: theme.colors.grey2,
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
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor:  theme.colors.selected1,
    backgroundColor: theme.colors.white,
  },
  selectedButton: {
    backgroundColor: theme.colors.selected1
  },
  optionButtonText: {
    color: theme.colors.selected1,
    fontSize: 16,
     fontWeight: 'bold'
  },
  selectedOptionButtonText: {
    color: theme.colors.white,
   
  },
  subOptionButton: {
    flex: 1,
    marginHorizontal: 5,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor:  theme.colors.selected2,
    backgroundColor: theme.colors.white,
  },
  subSelectedButton: {
    backgroundColor: theme.colors.selected2
  },
  subOptionButtonText: {
    color: theme.colors.selected2,
    fontSize: 16,
     fontWeight: 'bold'
  },
  subSelectedOptionButtonText: {
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
    gap: 40,
  },
  addTaskbuttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: theme.colors.primary, // Primary color background
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent background
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'red', // Red border
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'red', // Red text color
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ContentScreen;
