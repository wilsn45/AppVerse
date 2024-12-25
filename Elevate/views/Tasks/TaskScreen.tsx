import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { CategoryHandler } from '../../Handlers/CategoryHandler';
import { taskType } from '../../Data/DataModel';
import { useFocusEffect } from '@react-navigation/native';
import { TaskHandler } from '../../Handlers/Tasks/TaskHandler';
import { useNavigation } from '@react-navigation/native';
import theme from '../../Theme/Theme';
import DropDownList from '../Common/DropDownList';
import { AnalyticsHelper, ActionType } from '../../Analytics/AnalyticsHelper';

const TaskScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedTaskType, setSelectedTaskType] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigation = useNavigation();

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
    sendSaveImpressionEvent(selectedCategory, selectedTaskType);
    const fetchCategories = async () => {
      try {
        const liveCategories = await CategoryHandler.getLiveCategory();
        setCategories(liveCategories);
        console.log("Live Categories", liveCategories)
        sendCategoryDisplayedEvent(selectedCategory, selectedTaskType);
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
        <Text style={styles.taskDetails}>
          {categories.find((c) => c.id === item.categoryId)?.name ||
            'Unknown'} {'  '}
          {taskType.find((t) => t.id === item.type)?.title || 'Unknown'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleTaskPress = (task) => {
    sendTaskOpenEvent(task.categoryId, task.contentId, task.id);
    if (task.type === 1) {
      navigation.navigate('RoutineTaskScreen', { task });
    } else if (task.type === 2) {
      navigation.navigate('GoalTaskScreen', { task });
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    sendCategoryClickedEvent(categoryId);
  };

  const handleTaskTypeSelect = (taskUd) => {
    setSelectedTaskType(taskUd);
    sendTaskTypeChangeEvent(taskUd);
  };

  // Analytics Events
  const sendSaveImpressionEvent = async (selectedCategoryId, selectedTaskType) => {
    await AnalyticsHelper.sendEvent('3.0.0', 'Task_Appeared', 'Task', '', ActionType.IMPRESSION, '', {
      selectedCategoryId,
      selectedTaskType,
    });
  };

  const sendCategoryDisplayedEvent = async (selectedCategoryId, selectedTaskType) => {
    await AnalyticsHelper.sendEvent('3.1.0', 'Content_List_Presented', 'Task', 'Content_List', ActionType.IMPRESSION, '', {
      selectedCategoryId,
      selectedTaskType,
    });
  };

  const sendTaskOpenEvent = async (categoryId, contentId, taskId) => {
    await AnalyticsHelper.sendEvent('3.1.1', 'Content_Clicked', 'Task', 'Content_List', ActionType.CLICK, '', {
      categoryId,
      contentId,
      taskId,
    });
  };

  const sendCategoryClickedEvent = async (categoryId) => {
    await AnalyticsHelper.sendEvent('3.2.1', 'Categoy_Filter_Selected', 'Task', 'Category_Filter', ActionType.CLICK, '', {
      categoryId,
    });
  };

  const sendTaskTypeChangeEvent = async (taskType) => {
    await AnalyticsHelper.sendEvent('3.2.2', 'Task_Type_Changed', 'Task', 'Task_Tab', ActionType.CLICK, '', {
      taskType,
    });
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
        contentContainerStyle={styles.taskList}
        ListEmptyComponent={
          <Text style={styles.emptyText} accessibilityLabel="No Tasks Found">
            No tasks found.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundWhite,
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
    backgroundColor: theme.colors.backgroundWhite,
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
    fontSize: 18,
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
    borderColor: theme.colors.borderGrey,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  taskName: {
    fontSize: 16,
    color: theme.colors.black,
    fontWeight: 'bold',
  },
  taskDetails: {
    color: theme.colors.textGrey1,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: 'grey',
    marginTop: 20,
  },
});

export default TaskScreen;
