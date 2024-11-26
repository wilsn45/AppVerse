import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from './views/HomeScreen'; // Adjust the path as needed
import ContentScreen from './views/ContentScreen'; // Adjust the path as needed
import ContentDetailScreen from './views/ContentDetailScreen'; // Adjust the path as needed
import SavedScreen from './views/SaveScreen.tsx'; // You need to create this screen
import TaskScreen from './views/TaskScreen'; // You need to create this screen
import RoutineTaskScreen from './views/RoutineTaskScreen.tsx';
import GoalTaskScreen from './views/GoalTaskScreen.tsx';
import theme from './Theme/Theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Save') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary, 
        tabBarInactiveTintColor: theme.colors.grey1,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }} // Hides the "Home" title from Tab
      />
      <Tab.Screen
        name="Save"
        component={SavedScreen}
        options={{
          headerShown: false, // Hide header if necessary
          title: 'Saved', // Tab title
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TaskScreen}
        options={{
          headerShown: false, // Hide header if necessary
          title: 'Tasks', // Tab title
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{ headerShown: false }} // Hide "Home" title in the Stack
        />
        <Stack.Screen
          name="ContentScreen"
          component={ContentScreen}
          options={{
            headerShown: true,
            title: 'Content', // Customize title if needed
            headerBackTitle: '', // Remove the back title
            headerTintColor: 'grey', // Change back button color to grey
          }}
        />
        <Stack.Screen
          name="ContentDetailScreen"
          component={ContentDetailScreen}
          options={{
            headerShown: true,
            headerBackTitle: '', 
            headerTintColor: 'grey',
            title: 'Description',
          }}
        />
        <Stack.Screen
          name="RoutineTaskScreen"
          component={RoutineTaskScreen}
          options={{
            headerShown: true,
            headerBackTitle: '', 
            headerTintColor: 'grey', 
            title: 'Task',
          }}
        />
        <Stack.Screen
          name="GoalTaskScreen"
          component={GoalTaskScreen}
          options={{
            headerShown: true,
            headerBackTitle: '', 
            headerTintColor: 'grey', 
            title: 'Task',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
