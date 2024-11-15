import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { categories } from '../Data/CategoryData'; // Import categories for the first dropdown
import { taskType } from '../Data/TaskData'; // Import taskType for the second dropdown

const TaskScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(0); // Default category is 'All'
  const [selectedTaskType, setSelectedTaskType] = useState(1); // Default task type is 'All'

  // Handle category change from the first dropdown
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Handle task type change from the second dropdown
  const handleTaskTypeChange = (value) => {
    setSelectedTaskType(value);
  };

  // Dropdown options for categories
  const categoryOptions = [
    { label: 'All', value: 0 },
    ...categories.map((category) => ({
      label: category.title,
      value: category.id,
    })),
  ];

  // Dropdown options for task types
  const taskTypeOptions = [
    ...taskType.map((task) => ({
      label: task.title,
      value: task.id,
    })),
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with two dropdowns */}
    
      <View style={styles.headerContainer}>
        {/* Left Dropdown for Task Type */}
        <View style={styles.dropdownContainer}>
          <RNPickerSelect
            onValueChange={handleTaskTypeChange}
            items={taskTypeOptions}
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
            items={categoryOptions}
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
    marginTop: 10, // 10px padding at the top
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  dropdownLeft: {
    flex: 1,
    alignItems: 'flex-start',
    marginTop: 10, // Ensure proper padding at top
  },
  dropdownRight: {
    flex: 1,
    alignItems: 'flex-end',
    marginTop: 10, // Ensure proper padding at top
  },
  icon: {
    marginTop: 10,
    width: 20,
    marginRight: 10,
  },
});

export default TaskScreen;
