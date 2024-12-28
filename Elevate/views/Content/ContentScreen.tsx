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
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SaveHandler } from '../../Handlers/SaveHandler.tsx';
import { LikeHandler } from '../../Handlers/LikeHandler.tsx';
import { TaskHandler } from '../../Handlers/Tasks/TaskHandler.tsx';
import { ContentListAnalytics } from '../../Analytics/ContentListAnalytics';
import theme from '../../Theme/Theme.js';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native'; 
import { ContentHandler } from '../../Handlers/ContentHandler';

const { width, height } = Dimensions.get('window');
const SCREEN_HEIGHT = Dimensions.get('window').height;
const NAVIGATION_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56; // Navigation bar height
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - NAVIGATION_BAR_HEIGHT; // Subtract navigation bar height



const ContentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categorytitle, categoryId } = route.params;
  const [contentList, setContentList] = useState([]);
  const [savedCards, setSavedCards] = useState<Map<string, boolean>>(new Map());
  const [likedCards, setLikedCards] = useState<Map<string, boolean>>(new Map());
  const [isModalVisible, setModalVisible] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [selectedContent, setSelectedContent] = useState(null); // Default to "Routine"
  const [selectedTaskType, setSelectedTaskType] = useState(1); // 0 for Routine, 1 for Goal
  const [selectedSubTaskType, setSelectedSubTaskType] = useState(1); // 0 for Daily, 1 for Weekly, 2 for Monthly


  const analytics = new ContentListAnalytics(categoryId)

  useEffect(() => {
     analytics.sendContentImpressionEvent()
     //console.log("Fetched categoryId:", categoryId)

    fetchContentList()
  }, [ , categoryId, navigation, categorytitle]);


  const fetchContentList = async () => {
    try {
        
        // Map the fetched documents to include doc.id and category name
        const contentList  = await ContentHandler.fetchContentByCategory(categoryId);
        //console.log("Fetched ContentList:", contentList)
        const sortedData = [...contentList].sort((a, b) => b.index - a.index);
        setContentList(contentList)
      analytics.sendContentListPresentedEvent()
    } catch (error) {
        console.error('Error fetching LiveCategory:', error);
    } finally {
        
    }
};

const loadCards = async () => {
  //console.log('Fetched list 2', contentList);
  
  const savedContentIds = await SaveHandler.getSavedCardByCategory(categoryId) || [];
  const likedContentIds =  await LikeHandler.getLikedCardByCategory(categoryId) || [];
  //console.log("savedContentIds", savedContentIds)
  //console.log("likedContentIds", likedContentIds)

  const updatedSavedCards = new Map();
  const updatedLikedCards = new Map();

  //console.log('Updated Liked: contentList  Count', contentList);

  //console.log("contentList length:", contentList.length);

  contentList.forEach((item) => {
    updatedSavedCards.set(item.id, savedContentIds.some((savedCard) => savedCard.id === item.id));
    updatedLikedCards.set(item.id, likedContentIds.some((likedCard) => likedCard.id === item.id));
  });

  setSavedCards(updatedSavedCards);
  setLikedCards(updatedLikedCards);
 // console.log('updatedSavedCards', updatedSavedCards);
};


useFocusEffect(
  useCallback(() => {
    navigation.setOptions({
      title: categorytitle,
    });
    fetchContentList()
  }, [ categoryId, navigation, categorytitle])
);

useFocusEffect(
  useCallback(() => {
    navigation.setOptions({
      title: categorytitle,
    });
    //console.log('LoadCard: Fetched list', contentList);
    if (contentList.length > 0) {
        loadCards();
    }
  }, [ contentList])
);
  

  const handleSave = async (content) => {
    const isSaved = savedCards.get(content.id);
    analytics.sendContentSavedEvent(isSaved, content.id)
    if (isSaved) {
      await SaveHandler.removeSave(categoryId, content.id);
    } else {
     // console.log("Saving Item", content)
      await SaveHandler.addSave(content);
    }
    // Update only the savedCards state here
    setSavedCards((prev) => new Map(prev).set(content.id, !isSaved));
  };
  
  const handleLike = async (content) => {
    const isLiked = likedCards.get(content.id);

    analytics.sendContentLikedEvent(isLiked, content.id)

    if (isLiked) {
      await LikeHandler.removeLike(categoryId, content.id);
      dencreaseLikeCount(content.id)
    } else {
      await LikeHandler.addLike(categoryId, content.id, content.title);
      increaseLikeCount(content.id)
    }
    // Update only the likedCards state here
    setLikedCards((prev) => new Map(prev).set(content.id, !isLiked));
    
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

  const handleCardPress = (content) => {
    console.log('Pass Likes Count', content.likeCount);
    navigation.navigate('ContentDetailScreen', { content });
  };

  const handleAddTask = (item) => {
    setSelectedContent(item)
    setModalVisible(true);
    analytics.sendAddTaskPresentedEvent(item.id)
  };

  const handleCancelAddTask = async () => { 
      setTaskName(''); 
      setSelectedSubTaskType(1)
      setSelectedTaskType(1); 
      setModalVisible(false); 
      analytics.sendCancelAddTaskPEvent(selectedContent.id)
  }

  const handleSubmitTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }
  
    try {
      
      await TaskHandler.addTask(taskName, selectedTaskType,selectedSubTaskType, selectedContent);
  
      // Log the task details to console (for debugging purposes)
      console.log(`Task Added selectedContent: ${selectedContent}`)
      
      setTaskName(''); 
      setSelectedSubTaskType(1)
      setSelectedTaskType(1); 
      setModalVisible(false); 
      analytics.sendAddTaskEvent(selectedContent.id, selectedTaskType, selectedSubTaskType)
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
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <TouchableOpacity onPress={() => handleCardPress(item)} style={styles.cardContent}
               accessibilityLabel={`Content Card: ${item.title}`}>
                <Image 
                    source={{ uri: item.imageUrl }} 
                     style={styles.tileImage} 
                  />
               <View>
                <Text style={styles.contentText}>{item.title}</Text>
                <Text style={styles.contentDescription}  accessibilityLabel={item.description} >{item.description}</Text>
              </View>
             
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleSave(item)}
                accessibilityLabel={savedCards.get(item.id) ?`Unsave Card`: 'Save Card'}>
                <Ionicons
                  name={savedCards.get(item.id) ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={savedCards.get(item.id) ? theme.colors.secondaryTheme : theme.colors.greyDark1}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButtonLike} onPress={() => handleLike(item)}
                accessibilityLabel={likedCards.get(item.id) ? `Unlike Card. Total like ${item.likeCount}`: `Like Card. Total like ${item.likeCount}`}>
                <Ionicons
                  name={likedCards.get(item.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={likedCards.get(item.id) ? theme.colors.primaryTheme : theme.colors.greyDark1}
                />
                <Text style={styles.likeCount}>{item.likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleAddTask(item)}
                 accessibilityLabel={'Add Task'}>
                <MaterialIcons name="add-task" size={24} color={theme.colors.greyDark1}/>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Task Modal */}
    {/* Task Modal */}
{/* Task Modal */}
<Modal visible={isModalVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}  accessibilityLabel={'Add Task Screen'}>
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
              onPress={() => setSelectedTaskType(1)}
              accessibilityLabel={'Routine Task'}   // 0 for Routine
            >
              <Text style={[styles.optionButtonText, selectedTaskType === 1 && styles.selectedOptionButtonText]}>
                Routine
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, selectedTaskType === 2 && styles.selectedButton]}
              onPress={() => setSelectedTaskType(2)} // 1 for Goal
              accessibilityLabel={'Goal Task'} 
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
                  accessibilityLabel={`Task Frequency ${value === 1 ? 'Daily' : value === 2 ? 'Weekly' : 'Monthly'}`} 
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
    backgroundColor: theme.colors.white,
  },
  cardContainer: {
    flex: 1,
    height: SCREEN_HEIGHT,
    backgroundColor: theme.colors.white,
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 15,
    paddingBottom: 120
  },
  cardContent: {
    height: '80%',
    justifyContent: 'flex-start',
    gap: 50,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 80,
  },
  contentText: {
    fontSize: 24,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '500'
  },
  contentDescription:  {
    fontSize: 18,
    color: theme.colors.greyText,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 30
  },
  iconButton: {
    padding: 10,
  },
  likeCount: {
    color: theme.colors.greyDark2,
   // fontWeight: 'bold'

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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: theme.colors.greyLight,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 16,
    fontWeight: '500'
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
     //borderWidth: 1,
    borderColor:  theme.colors.primaryTheme,
    backgroundColor:  theme.colors.white,
  },
  selectedButton: {
    backgroundColor: theme.colors.primaryTheme
  },
  optionButtonText: {
    color: theme.colors.primaryTheme,
    fontSize: 18,
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
    //borderWidth: 1,
    borderColor:  theme.colors.secondaryTheme,
    backgroundColor: theme.colors.white,
  },
  subSelectedButton: {
    backgroundColor: theme.colors.secondaryTheme
  },
  subOptionButtonText: {
    color: theme.colors.secondaryTheme,
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
  addTaskbuttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: theme.colors.secondaryTheme, 
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  disabledAddButton: {
    backgroundColor: theme.colors.secondaryThemeLight, 
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
    borderColor: theme.colors.primaryTheme, 
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.primaryTheme, 
    fontWeight: 'bold',
    fontSize: 16,
  },
  tileImage: {
    width: '90%',
    height: 200,
    borderRadius: 10,
    marginTop: 25,
    marginBottom: 5, // Space between image and button
    resizeMode: 'cover',
  },
});

export default ContentScreen;
