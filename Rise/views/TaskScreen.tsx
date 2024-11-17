import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList,TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { categories } from '../Data/CategoryData'; // Import categories for the first dropdown
import { taskType } from '../Data/TaskData'; // Import taskType for the second dropdown
import { useFocusEffect } from '@react-navigation/native';
import { TaskHandler } from '../Handlers/TaskHandler'; // Import TaskHandler
import { useNavigation } from '@react-navigation/native';

const TaskScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0); // Default category is 'All'
  const [selectedTaskType, setSelectedTaskType] = useState(0); // Default task type is 'All'
  const [tasks, setTasks] = useState([]); // State to hold tasks

  // Fetch tasks from TaskHandler
  const fetchTasks = async () => {
    try {
      const allTasks = await TaskHandler.getTasks();
      // Flatten the tasks into a single array for display
      const taskList = Object.keys(allTasks).flatMap((categoryId) =>
        allTasks[categoryId].map((task) => ({ ...task, categoryId }))
      );
      setTasks(taskList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

    // Re-fetch saved cards on screen focus
    useFocusEffect(
      React.useCallback(() => {
        fetchTasks();
      }, [])
    );

  useEffect(() => {
    fetchTasks(); // Fetch tasks when component mounts
  }, []);

  // Handle category change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Handle task type change
  const handleTaskTypeChange = (value) => {
    setSelectedTaskType(value);
  };

  // Filter tasks based on selectedCategory and selectedTaskType
  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      selectedCategory === 0 || task.categoryId === selectedCategory.toString();
    const matchesTaskType =
      selectedTaskType === 0 || task.type === selectedTaskType;
    return matchesCategory && matchesTaskType;
  });

  // Render a single task item
  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
       <TouchableOpacity
            onPress={() => handleTaskPress(item)}>
      <Text style={styles.taskName}>{item.name}</Text>
      <Text style={styles.taskDetails}>
         {taskType.find((t) => t.id === item.type)?.title || 'Unknown'} | 
         {categories.find((c) => c.id === parseInt(item.categoryId))?.title || 'Unknown'}
      </Text>
      </TouchableOpacity>
    </View>
  );

  const handleTaskPress = (task) => {
    
    const contentTitle = "Sample Content Title"; // Replace with actual content title
    if (task.type === 1) {
      navigation.navigate('RoutineTaskScreen', { task });
    } else if (task.type === 2) {
      navigation.navigate('TargetTaskScreen', { task });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with two dropdowns */}
      <View style={styles.headerContainer}>
        {/* Left Dropdown for Task Type */}
        <View style={styles.dropdownContainer}>
          <RNPickerSelect
            onValueChange={handleTaskTypeChange}
            items={[
              { label: 'All', value: 0 },
              ...taskType.map((task) => ({
                label: task.title,
                value: task.id,
              })),
            ]}
            value={selectedTaskType}
            style={pickerStyles}
            placeholder={{}}
            Icon={() => (
              <Ionicons
                name="chevron-down"
                size={20}
                color="white"
                style={styles.icon}
              />
            )}
          />
        </View>

        {/* Right Dropdown for Category */}
        <View style={styles.dropdownContainer}>
          <RNPickerSelect
            onValueChange={handleCategoryChange}
            items={[
              { label: 'All', value: 0 },
              ...categories.map((category) => ({
                label: category.title,
                value: category.id,
              })),
            ]}
            value={selectedCategory}
            style={pickerStyles}
            placeholder={{}}
            Icon={() => (
              <Ionicons
                name="chevron-down"
                size={20}
                color="white"
                style={styles.icon}
              />
            )}
          />
        </View>
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.taskId}
        contentContainerStyle={styles.taskList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks found.</Text>
        }
      />
    </SafeAreaView>
  );
};

const pickerStyles = StyleSheet.create({
  inputIOS: {
    backgroundColor: 'grey',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingRight: 35,
    borderRadius: 5,
    fontSize: 16,
    width: '100%',
    alignSelf: 'stretch',
  },
  inputAndroid: {
    backgroundColor: 'grey',
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingRight: 35,
    borderRadius: 5,
    fontSize: 16,
    width: '100%',
    alignSelf: 'stretch',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  icon: {
    marginTop: 10,
    width: 20,
    marginRight: 10,
  },
  taskList: {
    padding: 10,
  },
  taskItem: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  taskName: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  taskDetails: {
    fontSize: 14,
    color: 'grey',
  },
  emptyText: {
    textAlign: 'center',
    color: 'grey',
    marginTop: 20,
  },
});

export default TaskScreen;
