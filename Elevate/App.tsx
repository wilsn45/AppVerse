import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './views/HomeScreen';
import CourseListScreen from './views/Courses/CourseListScreen.tsx'; 
import TopicsScreen from './views/Courses/TopicsScreen.tsx'; 
import CourseScreen from './views/Courses/CourseScreen.tsx';
import ChapterScreen from './views/Chapter/ChapterScreen.tsx';
import MyCourseScreen from './views/MyCourseScreen.tsx';
import LetsStartScreen from './views/GetStarted/LetsStartScreen.tsx'; 
import SplashScreen from './views/GetStarted/SplashScreen.tsx'; 
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

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            //return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
          } else if (route.name === 'My Course') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
            //return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkbox-marked' : 'checkbox-outline';
            //return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.black,
        tabBarInactiveTintColor: theme.colors.black,
        tabBarStyle: {
        //  backgroundColor: theme.colors.backgroundGrey2,
        }
      })}
    >
      <Tab.Screen
        name="Home" // Changed name to avoid conflict
        component={HomeScreen}
        options={{ headerShown: false}}
      />
      <Tab.Screen
        name="My Course"
        component={MyCourseScreen}
        options={{
          headerShown: false,
          title: 'My Course',
        }}
      />
      {/* <Tab.Screen
        name="Tasks"
        component={TaskScreen}
        options={{
          headerShown: false,
          title: 'Tasks',
        }}
      /> */}
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
      <Stack.Navigator  screenOptions={{
      headerTintColor: theme.colors.black,
      headerBackTitleVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.white,
        shadowColor: 'transparent',
      },
    }}>
        
        <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{ headerShown: false }}
        />

        <Stack.Screen
            name="LetsStartScreen"
            component={LetsStartScreen}
            options={{ 
             headerShown: false }}
        />

         <Stack.Screen
          name="HomeTabNavigator" // HomeTabNavigator will always be available
          component={TabNavigator}
          options={{ 
             ...TransitionPresets.ModalSlideFromBottomIOS,
            headerShown: false }}
        />

      
        {/* Other screens */}
        <Stack.Screen
          name="CourseListScreen"
          component={CourseListScreen}
          options={{
            headerShown: true,
            title: '',
            headerBackTitle: '',
            headerTintColor: theme.colors.black,
          }}
        />

         {/* Other screens */}
        <Stack.Screen
          name="TopicsScreen"
          component={TopicsScreen}
          options={{
            headerShown: true,
            title: 'Topics',
            headerBackTitle: '',
            headerTintColor: theme.colors.black,
          }}
        />

        
        <Stack.Screen
          name="CourseScreen"
          component={CourseScreen}
          options={{
            headerShown: true,
            headerBackTitle: '',
            headerTintColor: theme.colors.black,
            title: '',
          }}
        />

      <Stack.Screen
          name="ChapterScreen"
          component={ChapterScreen}
          options={{
            headerShown: true,
            headerBackTitle: '',
            headerTintColor: theme.colors.black,
            title: '',
          }}
        />  
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
