import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { CategoryHandler } from '../../Handlers/CategoryHandler';
import { taskType } from '../../Data/DataModel';
import { useFocusEffect } from '@react-navigation/native';
import { TaskHandler } from '../../Handlers/Tasks/TaskHandler';
import { useNavigation } from '@react-navigation/native';
import theme from '../../Theme/Theme';
import DropDownList from '../Common/DropDownList';
import { TaskAnalytics } from '../../Analytics/TaskAnalytics';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TaskScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedTaskType, setSelectedTaskType] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();
  const analytics = new TaskAnalytics()

  const fetchTasks = async () => {
    try {
      const allTasks = await TaskHandler.getTasks();
      const taskList = Object.keys(allTasks).flatMap((categoryId) =>
        allTasks[categoryId].map((task) => ({ ...task, categoryId }))
      );
      setTasks(taskList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    analytics.sendSaveImpressionEvent(selectedCategory, selectedTaskType);
    const fetchCategories = async () => {
      try {
        const liveCategories = await CategoryHandler.getLiveCategory();
        setCategories(liveCategories);
        console.log("Live Categories", liveCategories)
        analytics.sendCategoryDisplayedEvent(selectedCategory, selectedTaskType);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };

    fetchCategories();
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      selectedCategory === 0 || task.categoryId === selectedCategory.toString();
    const matchesTaskType =
      selectedTaskType === 0 || task.type === selectedTaskType;
    return matchesCategory && matchesTaskType;
  });

  const renderTask = ({ item }) => (
    <View
      style={styles.taskItem}
    >
      <TouchableOpacity
        onPress={() => handleTaskPress(item)}
        accessibilityLabel={`Task Button: ${item.name}`}
      >
       
        <Text style={styles.taskName}>{item.name}</Text>

        <View style={styles.taskDetailView}>
          <Text style={styles.categoryText}>{item.content.categoryTitle}</Text>
          <Text style={styles.taskTypeText}>
          {taskType.find((t) => t.id === item.type)?.title || 'Unknown'}
        </Text>
        </View>
        
      </TouchableOpacity>
    </View>
  );

  const handleTaskPress = (task) => {
    analytics.sendTaskOpenEvent(task.content.categoryId, task.content.id, task.id);
    if (task.type === 1) {
      navigation.navigate('RoutineTaskScreen', { task });
    } else if (task.type === 2) {
      navigation.navigate('GoalTaskScreen', { task });
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    analytics.sendCategoryClickedEvent(categoryId);
  };

  const handleTaskTypeSelect = (taskUd) => {
    setSelectedTaskType(taskUd);
    analytics.sendTaskTypeChangeEvent(taskUd);
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View
        style={styles.headerContainer}>
        <View style={styles.taskControlContainer}>
          {/* Task Type Buttons */}
          <View style={styles.buttonGroup}>
            {[
              { id: 0, title: 'All' },
              { id: 1, title: 'Routine' },
              { id: 2, title: 'Goal' },
            ].map((button) => (
              <TouchableOpacity
                key={button.id}
                style={[
                  styles.taskTypeButton,
                  selectedTaskType === button.id && styles.selectedTaskTypeButton,
                ]}
                onPress={() => handleTaskTypeSelect(button.id)}
                accessible
                accessibilityLabel={`Task Type Button: ${button.title}`}
              >
                <Text
                  style={[
                    styles.taskTypeButtonText,
                    selectedTaskType === button.id && styles.selectedTaskTypeButtonText,
                  ]}
                >
                  {button.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Dropdown */}
          <View
            style={styles.dropdownContainer}
           
          >
            <DropDownList
              source={'Task_Category'}
              data={[
                { id: 0, title: 'All' },
                ...categories.map((category) => ({
                  id: category.id,
                  title: category.name,
                })),
              ]}
              defaultId={selectedCategory}
              onSelection={(id) => handleCategorySelect(id)}
            />
          </View>
        </View>
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.taskId}
        contentContainerStyle={filteredTasks.length === 0 ? styles.emptyContainer : styles.taskList}
        ListEmptyComponent={
          <View style={styles.noTaskView}>
           <Text style={styles.emptyText} accessibilityLabel="No Tasks Found">
           Nothing here yet!
            </Text>
            {/* <Ionicons
                  name={'clipboard-outline'}
                  size={30}
                  color={theme.colors.greyLight3}
                /> */}
          </View>
          
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 10,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: 10,
  },
  taskList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyContainer: {
    flexGrow: 1, // Ensures the empty container takes full space
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', // Match the screen height
  },
  noTaskView: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 30,
    fontWeight: '500',
    color: theme.colors.greyLight3
  },
  taskControlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'flex-start',
    marginHorizontal: 5,
  },
  taskTypeButton: {
    backgroundColor: theme.colors.white,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 13,
    marginHorizontal: 5,
    borderColor: theme.colors.primaryTheme,
    //borderWidth: 1,
  },
  selectedTaskTypeButton: {
    backgroundColor: theme.colors.primaryTheme,
  },
  taskTypeButtonText: {
    fontWeight: 'bold',
    color: theme.colors.primaryTheme,
    fontSize: 16,
  },
  selectedTaskTypeButtonText: {
    color: theme.colors.white,
  },
  dropdownContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  taskList: {
    padding: 10,
  },
  taskItem: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.greyLight2,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  taskName: {
    fontSize: 16,
    color: theme.colors.black,
    fontWeight: 'bold',
  },
  taskDetailView: {
    paddingTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 5,
    flexDirection: 'row'
  },

  categoryText: {
    color: theme.colors.greyLight3,
    fontWeight: '800',
    fontSize: 14,
  },
  taskTypeText: {
    color: theme.colors.greyLight3,
    fontSize: 12,
  },
});

export default TaskScreen;
