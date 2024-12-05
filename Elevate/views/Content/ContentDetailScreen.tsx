import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SaveHandler } from '../../Handlers/SaveHandler.tsx';
import { LikeHandler } from '../../Handlers/LikeHandler.tsx';
import { TaskHandler } from '../../Handlers/Tasks/TaskHandler.tsx';
import theme from '../../Theme/Theme';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const ContentDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { itemTitle, itemId,categoryId,likeCount } = route.params; // Access the item title and ID passed as parameters
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likedCount, setLikedCount] = useState(0)
  const [isModalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState(1); // 0 for Routine, 1 for Goal
  const [selectedSubTaskType, setSelectedSubTaskType] = useState(1); // 0 for Daily, 1 for Weekly, 2 for Monthly
  const [htmlContent, setHtmlContent] = useState('');
  


  useEffect(() => {
    const checkIfLiked = async () => {
      const liked = await LikeHandler.isCardLiked(categoryId, itemId); // Check if the card is liked using categoryId and itemId
      setIsLiked(liked);
    };

    const checkIfSaved = async () => {
      const liked = await SaveHandler.isCardSaved(categoryId, itemId); // Check if the card is liked using categoryId and itemId
      setIsSaved(liked);
    };

    checkIfLiked(); 
    checkIfSaved();
    setLikedCount(likeCount)
    console.log('Like Count', likeCount);
    console.log('Liked Count', likedCount);

    const fetchContent = async () => {
      try {
        const docSnapshot = await firestore()
          .collection('Content')
          .doc('Doc') 
          .collection(categoryId)
          .doc(itemId)
          .get();

          console.log('Category id', categoryId);
          console.log('Item id', itemId);

        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          setHtmlContent(data?.htmlContent || ''); 
        } else {
          console.log('Document not found!');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();

  }, [itemId, categoryId]);


  const handleSave = async () => {
    if (isSaved) {
      await SaveHandler.removeSave(categoryId, itemId);
    } else {
      await SaveHandler.addSave(categoryId, itemId, itemTitle);
    }
    // Update only the savedCards state here
    setIsSaved(!isSaved)
  };
  
  const handleLike = async () => {
    if (isLiked) {
      setIsLiked(false)
      await LikeHandler.removeLike(categoryId, itemId);
      dencreaseLikeCount(itemId)
    } else {
      setIsLiked(true)
      await LikeHandler.addLike(categoryId, itemId, itemTitle);
      increaseLikeCount(itemId)
    }
  };

  const increaseLikeCount = (id) => {
    setLikedCount(likedCount+1)
    const docRef = firestore().collection('Content').doc('List').collection(categoryId).doc(id);
    docRef.update({
      likeCount: firestore.FieldValue.increment(1)  // Increments the count by 1
    })
    .then(() => {
      console.log("Count updated successfully");
    })
    .catch((error) => {
      console.error("Error updating count: ", error);
    });
  };

  const dencreaseLikeCount = (id) => {
    const docRef = firestore().collection('Content').doc('List').collection(categoryId).doc(id);

    docRef.update({
      likeCount: firestore.FieldValue.increment(-1)  // Increments the count by 1
    })
    .then(() => {
      console.log("Count updated successfully");
    })
    .catch((error) => {
      console.error("Error updating count: ", error);
    });

    setLikedCount(likedCount-1)
  };

  const handleAddTask = () => {
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
      const contentTitle  = itemTitle

      await TaskHandler.addTask(taskName, selectedTaskType,selectedSubTaskType, itemId,contentTitle, categoryId);
  
      // Log the task details to console (for debugging purposes)
      console.log(`Task Added contentTitle: ${contentTitle}`)
      console.log(`Task Added: ${taskName}, Type: ${selectedTaskType}, Category: ${categoryId}, ContentId: ${itemId}`);
  
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
     {/* <Text style={styles.title}>{itemTitle}</Text> */}
      <View style={styles.mainContent}>
        {htmlContent ? (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webView}
          />
        ) : (
          <Text>Loading...</Text>
        )}
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
      <TouchableOpacity style={styles.iconButton} onPress={() => handleSave()}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={isSaved ? theme.colors.green : theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButtonLike} onPress={() => handleLike()}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isLiked ? theme.colors.red : theme.colors.primary}
                />
                <Text>{likedCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleAddTask()}>
                <MaterialIcons name="add-task" size={24} color={theme.colors.primary}/>
              </TouchableOpacity>
      </View>

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
            <TouchableOpacity  style={[styles.addButton, taskName.trim() === '' && styles.disabledAddButton]} onPress={handleSubmitTask} disabled={taskName.trim() === ''}>
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
    paddingBottom: 80, // Ensure content does not overlap footer
  },
  mainContent: {
    flex: 1,
  },
  webView: {
    flex: 1,
    marginVertical: 0,
    borderRadius: 2,
  },
  title: {
    fontSize: 26,
    color: theme.colors.black,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 18,
    color: theme.colors.grey1,
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grey2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
  },
  footerButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: theme.colors.primary, 
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  disabledAddButton: {
    backgroundColor: theme.colors.primaryDisabled, 
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

export default ContentDetailScreen;
