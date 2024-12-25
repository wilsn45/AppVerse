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
import { AnalyticsHelper, ActionType } from '../../Analytics/AnalyticsHelper';
import theme from '../../Theme/Theme';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const ContentDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { content } = route.params; // Access the item title and ID passed as parameters
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likedCount, setLikedCount] = useState(0)
  const [isModalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState(1); // 0 for Routine, 1 for Goal
  const [selectedSubTaskType, setSelectedSubTaskType] = useState(1); // 0 for Daily, 1 for Weekly, 2 for Monthly
  const [htmlContent, setHtmlContent] = useState('');
  

  useEffect(() => {
    console.log("Content Data", content)
    sendContentImpressionEvent()
    const checkIfLiked = async () => {
      const liked = await LikeHandler.isCardLiked(content.categoryId, content.id); // Check if the card is liked using categoryId and itemId
      setIsLiked(liked);
    };

    const checkIfSaved = async () => {
      const liked = await SaveHandler.isCardSaved(content.categoryId, content.id); // Check if the card is liked using categoryId and itemId
      setIsSaved(liked);
    };

    checkIfLiked(); 
    checkIfSaved();

    const fetchContent = async () => {
      try {
        const contetnDocSnapshot = await firestore()
        .collection('Content')
        .doc('List') 
        .collection(content.categoryId)
        .doc(content.id)
        .get();

      if (contetnDocSnapshot.exists) {
        const data = contetnDocSnapshot.data();
        setLikedCount(data?.likeCount || 0)
      } else {
        console.log('Like Document not found!');
      }
      } catch (error) {
        console.error('Like Error fetching content:', error);
      }

        const docSnapshot = await firestore()
          .collection('Content')
          .doc('Doc') 
          .collection(content.categoryId)
          .doc(content.id)
          .get();

          console.log('Category id', content.categoryId);
          console.log('Item id', content.id);

        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          setHtmlContent(data?.htmlContent || ''); 
          sendContentListPresentedEvent()
        } else {
          console.log('Document not found!');
        }


       
    };

    fetchContent();

  }, [content]);


  const handleSave = async () => {
    sendContentSavedEvent(isSaved)
    if (isSaved) {
      await SaveHandler.removeSave(content.categoryId, content.id);
    } else {
      await SaveHandler.addSave(content);
    }
    // Update only the savedCards state here
    setIsSaved(!isSaved)
  };
  
  const handleLike = async () => {
    sendContentLikedEvent(isLiked)
    if (isLiked) {
      setIsLiked(false)
      await LikeHandler.removeLike(content.categoryId, content.id);
      dencreaseLikeCount(content.id)
    } else {
      setIsLiked(true)
      await LikeHandler.addLike(content.categoryId, content.id, content.title);
      increaseLikeCount(content.id)
    }
  };

  const increaseLikeCount = (id) => {
    setLikedCount(likedCount+1)
    const docRef = firestore().collection('Content').doc('List').collection(content.categoryId).doc(id);
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

  const dencreaseLikeCount = async (id) => {
    console.log("Content Data", content)
    const docRef = firestore().collection('Content').doc('List').collection(content.categoryId).doc(id);
  
    // Fetch the current likeCount before decreasing it
    try {
      const docSnapshot = await docRef.get();
  
      if (docSnapshot.exists) {
        const currentLikeCount = docSnapshot.data().likeCount;
  
        // Only decrease likeCount if it's greater than 0
        if (currentLikeCount > 0) {
          docRef.update({
            likeCount: firestore.FieldValue.increment(-1)  // Decrements the count by 1
          })
          .then(() => {
            console.log("Count updated successfully");
          })
          .catch((error) => {
            console.error("Error updating count: ", error);
          });
  
          // Update the local state for likedCount
          setLikedCount((prevLikedCount) => prevLikedCount - 1);
        } else {
          console.log("likeCount is already 0, cannot decrease");
        }
      } else {
        console.log("Document does not exist, cannot decrease likeCount");
      }
    } catch (error) {
      console.error("Error fetching like count: ", error);
    }
  };

  const handleAddTask = () => {
    sendAddTaskPresentedEvent()
    setModalVisible(true);
  };

  const handleCancelAddTask = async () => { 
      setTaskName(''); 
      setSelectedSubTaskType(1)
      setSelectedTaskType(1); 
      setModalVisible(false); 
      sendCancelAddTaskPEvent()
  }

  const handleSubmitTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }
  
    try {
      // Call the addTask method from TaskHandler to save the task
      const contentTitle  = content.title
      await TaskHandler.addTask(taskName, selectedTaskType,selectedSubTaskType, content);

      setTaskName(''); 
      setSelectedSubTaskType(1)
      setSelectedTaskType(1); 
      setModalVisible(false); 
      sendAddTaskEvent(selectedTaskType,selectedSubTaskType)
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert('Error', 'Something went wrong while adding the task.');
    }
  };


  //Analytics Event
  const sendContentImpressionEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '5.0.0',
      'Content_Detail_Appeared',
      'Content_Detail',
      '',
      ActionType.IMPRESSION,
      '',
      { 'categoryId': content.categoryId, contentId: content.id}
   );
  };

  const sendContentListPresentedEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '5.1.0',
      'Content_Presented',
      'Content_Detail',
      'Content',
      ActionType.IMPRESSION,
      '',
      { 'categoryId': content.categoryId, contentId: content.id}
   );
  };

  const sendContentSavedEvent = async (isSave: boolean) => {
     const optionType =  isSave ? 'Save' : 'Remove'
     const eventId =  isSave ? '5.1.1.1' : '5.1.1.2'
     const eventName =  isSave ? 'Content_Saved' : 'Content_Saved_Removed'
    await AnalyticsHelper.sendEvent(
      eventId,
      eventName,
      'Content_Detail',
      'Save',
      ActionType.CLICK,
      optionType,
      { 'categoryId': content.categoryId, 'contentId': content.id}
   );
  };

  const sendContentLikedEvent = async (isLike: boolean) => {
    const optionType =  isLike ? 'Like' : 'Remove'
    const eventId =  isLike ? '5.2.1.1' : '5.2.1.2'
     const eventName =  isLike ? 'Content_Liked' : 'Content_Like_Removed'
   await AnalyticsHelper.sendEvent(
     eventId,
     eventName,
     'Content_Detail',
     'Like',
     ActionType.CLICK,
     optionType,
     { 'categoryId': content.categoryId, 'contentId': content.id}
  );
 };

 const sendAddTaskPresentedEvent = async () => {
  
 await AnalyticsHelper.sendEvent(
   '5.3.0',
   'Add_Task_Presented',
   'Content_Detail',
   'Add_Task',
   ActionType.IMPRESSION,
   '',
   { 'categoryId': content.categoryId, 'contentId': content.id}
);
};

const sendAddTaskEvent = async (taskType: number, freqType: number) => {
  
  await AnalyticsHelper.sendEvent(
    '5.3.1.2',
    'Add_Task_Cancelled',
    'Content_Detail',
    'Add_Task',
    ActionType.CLICK,
    'Cancel',
    { 'categoryId': content.categoryId, 'contentId': content.id, 'taskType': taskType, 'freqType': freqType}
 );
 };

const sendCancelAddTaskPEvent = async () => {
  
  await AnalyticsHelper.sendEvent(
    '5.3.1.2',
    'Add_Task_Cancelled',
    'Content_Detail',
    'Add_Task',
    ActionType.CLICK,
    'Cancel',
    { 'categoryId': content.categoryId, 'contentId': content.id}
 );
 };


 const sendBackEvent = async () => {
  
  await AnalyticsHelper.sendEvent(
    '5.4.1.1',
    'Back_Clicked',
    'Content_List',
    'Header',
    ActionType.CLICK,
    'Back',
    { 'categoryId': content.categoryId}
 );
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
      <TouchableOpacity style={styles.iconButton} onPress={() => handleSave()}
        accessibilityLabel={isSaved ?`Unsave Card`: 'Save Card'}>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={isSaved ? theme.colors.green : theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButtonLike} onPress={() => handleLike()}
                accessibilityLabel={isLiked ? `Unlike Card. Total like ${likedCount}`: `Like Card. Total like ${likedCount}`}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isLiked ? theme.colors.red : theme.colors.primary}
                />
                <Text>{likedCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleAddTask()}
                accessibilityLabel={'Add Task'}>
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
