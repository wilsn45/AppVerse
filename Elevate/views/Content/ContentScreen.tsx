import React, { useEffect, useCallback, useState,  } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SaveHandler } from '../../Handlers/SaveHandler.tsx';
import { LikeHandler } from '../../Handlers/LikeHandler.tsx';
import { TaskHandler } from '../../Handlers/Tasks/TaskHandler.tsx';
import theme from '../../Theme/Theme.js';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native'; // Ensure this is correctly imported


const { height } = Dimensions.get('window');



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
    fetchContentList()
  }, [ , categoryId, navigation, tileType]);


  const fetchContentList = async () => {
    try {
        // Fetch categories from the updated path
        console.log('Category id', categoryId);
        const snapshot = await firestore().collection('Content').doc('List').collection(categoryId).get();
        
        // Map the fetched documents to include doc.id and category name
        const contentList = snapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title, 
            likeCount: doc.data().likeCount,
            description: doc.data().description,
            index: doc.data().index
        }));
        
        setContentList(contentList)
        

    } catch (error) {
        console.error('Error fetching LiveCategory:', error);
    } finally {
        
    }
};

const loadCards = async () => {
  console.log('Fetched list 2', contentList);
  const savedItemsPromise = SaveHandler.getSaves();
  const likedItemsPromise = LikeHandler.getLikes();

  const [savedItems, likedItems] = await Promise.all([savedItemsPromise, likedItemsPromise]);

  const savedContentIds = savedItems[categoryId] || [];
  const likedContentIds = likedItems[categoryId] || [];

  const updatedSavedCards = new Map();
  const updatedLikedCards = new Map();

  console.log('Updated Liked: contentList  Count', contentList);

  contentList.forEach((item) => {
    updatedSavedCards.set(item.id, savedContentIds.some((savedCard) => savedCard.contentId === item.id));
    updatedLikedCards.set(item.id, likedContentIds.some((likedCard) => likedCard.contentId === item.id));
  });

  setSavedCards(updatedSavedCards);
  setLikedCards(updatedLikedCards);
  console.log('Updated Liked Count', updatedLikedCards);
};


useFocusEffect(
  useCallback(() => {
    navigation.setOptions({
      title: tileType,
    });
    fetchContentList()
  }, [ categoryId, navigation, tileType])
);

useFocusEffect(
  useCallback(() => {
    navigation.setOptions({
      title: tileType,
    });
    console.log('LoadCard: Fetched list', contentList);
    if (contentList.length > 0) {
       loadCards();
    }
  }, [ contentList])
);
  

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

    
// Update the count property
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

    setContentList((prevContentList) => {
      return prevContentList.map(item => {
        if (item.id === id) {
          return { ...item, likeCount: item.likeCount + 1 };
        }
        return item;
      });
    });
  };

  const dencreaseLikeCount = async (id) => {
    const docRef = firestore().collection('Content').doc('List').collection(categoryId).doc(id);
  
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
  
          setContentList((prevContentList) => {
            return prevContentList.map(item => {
              if (item.id === id) {
                return { ...item, likeCount: item.likeCount - 1 };
              }
              return item;
            });
          });
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

  const handleCardPress = (item: { id: string, title: string }) => {
    console.log('Pass Likes Count', item.likeCount);
    navigation.navigate('ContentDetailScreen', { itemId: item.id, itemTitle: item.title, categoryId: categoryId });
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
              <Text style={styles.contentDescription}>{item.description}</Text>
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
                <Text>{item.likeCount}</Text>
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
     padding: 20
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
    alignItems: 'center',
  },
  contentText: {
    fontSize: 24,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 10,
  },
  contentDescription:  {
    fontSize: 20,
    color: theme.colors.greyText,
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

export default ContentScreen;
