import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from './views/HomeScreen';
import ContentScreen from './views/ContentScreen';
import ContentDetailScreen from './views/ContentDetailScreen';
import SavedScreen from './views/SaveScreen.tsx';
import TaskScreen from './views/TaskScreen';
import RoutineTaskScreen from './views/RoutineTaskScreen.tsx';
import GoalTaskScreen from './views/GoalTaskScreen.tsx';
import LetsStartScreen from './views/LetsStartScreen'; 
import SplashScreen from './views/SplashScreen'; 
import ProfileHandler from './Handlers/ProfileHandler'; 
import theme from './Theme/Theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'HomeTab') {
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
        name="HomeTab" // Changed name to avoid conflict
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Save"
        component={SavedScreen}
        options={{
          headerShown: false,
          title: 'Saved',
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TaskScreen}
        options={{
          headerShown: false,
          title: 'Tasks',
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const onboardedStatus = await ProfileHandler.getIsOnboarded();
      setIsOnboarded(onboardedStatus);
    };
    
    checkOnboardingStatus();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{ headerShown: false }}
        />

        <Stack.Screen
            name="LetsStartScreen"
            component={LetsStartScreen}
            options={{ headerShown: false }}
        />

         <Stack.Screen
          name="HomeTabNavigator" // HomeTabNavigator will always be available
          component={TabNavigator}
          options={{ headerShown: false }}
        />

       

        {/* Other screens */}
        <Stack.Screen
          name="ContentScreen"
          component={ContentScreen}
          options={{
            headerShown: true,
            title: 'Content',
            headerBackTitle: '',
            headerTintColor: theme.colors.black,
          }}
        />
        <Stack.Screen
          name="ContentDetailScreen"
          component={ContentDetailScreen}
          options={{
            headerShown: true,
            headerBackTitle: '',
            headerTintColor: theme.colors.black,
            title: '',
          }}
        />
        <Stack.Screen
          name="RoutineTaskScreen"
          component={RoutineTaskScreen}
          options={{
            headerShown: true,
            headerBackTitle: '',
            headerTintColor: theme.colors.black,
            title: 'Task',
          }}
        />
        <Stack.Screen
          name="GoalTaskScreen"
          component={GoalTaskScreen}
          options={{
            headerShown: true,
            headerBackTitle: '',
            headerTintColor: theme.colors.black,
            title: 'Task',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
