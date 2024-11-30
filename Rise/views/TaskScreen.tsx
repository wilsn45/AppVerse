import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { categories } from '../Data/CategoryData'; 
import { taskType } from '../Data/TaskData';
import { useFocusEffect } from '@react-navigation/native';
import { TaskHandler } from '../Handlers/TaskHandler';
import { useNavigation } from '@react-navigation/native';
import theme from '../Theme/Theme';
import DropDownList from './Common/DropDownList'; 

const TaskScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedTaskType, setSelectedTaskType] = useState(0);
  const [tasks, setTasks] = useState([]);
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
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => handleTaskPress(item)}>
        <Text style={styles.taskName}>{item.name}</Text>
        <Text style={styles.taskDetails}>
          {taskType.find((t) => t.id === item.type)?.title || 'Unknown'} |{' '}
          {categories.find((c) => c.id === parseInt(item.categoryId))?.title ||
            'Unknown'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleTaskPress = (task) => {
    if (task.type === 0) {
      navigation.navigate('RoutineTaskScreen', { task });
    } else if (task.type === 1) {
      navigation.navigate('GoalTaskScreen', { task });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Task</Text>
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
                onPress={() => setSelectedTaskType(button.id)}
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
          <View style={styles.dropdownContainer}>
            <DropDownList
              data={[
                { id: 0, title: 'All' },
                ...categories.map((category) => ({
                  id: category.id,
                  title: category.title,
                })),
              ]}
              defaultId={selectedCategory}
              onSelection={(id) => setSelectedCategory(id)}
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
          <Text style={styles.emptyText}>No tasks found.</Text>
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
    backgroundColor: theme.colors.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  selectedTaskTypeButton: {
    backgroundColor: theme.colors.primary,
  },
  taskTypeButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  selectedTaskTypeButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
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
    borderColor: theme.colors.grey2,
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
    fontSize: 14,
    color: theme.colors.grey1,
  },
  emptyText: {
    textAlign: 'center',
    color: 'grey',
    marginTop: 20,
  },
});

export default TaskScreen;
