import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import ProfileDBHandler from '../../DBHandler/ProfileDBHandler';
import theme from '../../Theme/Theme';
import { AnalyticsHelper, ActionType } from '../../Analytics/AnalyticsHelper';

const LetsStartScreen = ({ navigation }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    sendLetsStartmpressionEvent();
  }, [navigation]);

  const handleStart = async () => {
    if (name.trim()) {
      // Save the user's name and onboarding status (isOnboarded = true)
      await ProfileDBHandler.saveProfile(name, true);
      sendNavigateToHomeEvent();
      navigation.navigate('HomeTabNavigator');
    } else {
      sendWrongInputnEvent();
      alert('Please enter your name.');
    }
  };

  const sendLetsStartmpressionEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '9.0.0',
      'LetsStart_Appeared',
      'LetsStart',
      '',
      ActionType.IMPRESSION,
      '',
      {}
    );
  };

  const sendWrongInputnEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '9.1.1.2',
      'Wrong_User_Input',
      'LetsStart',
      '',
      ActionType.IMPRESSION,
      'Wrong',
      {}
    );
  };

  const sendNavigateToHomeEvent = async () => {
    await AnalyticsHelper.sendEvent(
      '9.1.1.1',
      'Navigate_To_Home',
      'LetsStart',
      '',
      ActionType.IMPRESSION,
      'Correct',
      {}
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>What's your name?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Let's Start</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%', // Allow child elements to take the full width
    alignItems: 'center', // Align children to the left
  },
  title: {
    width: '80%',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Roboto-Medium',
    textAlign: 'left', // Align text to the left
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: theme.colors.grey2,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderRadius: 5,
  },
  buttonText: {
    color: theme.colors.primary,
    fontStyle: 'italic',
    fontSize: 30,
    fontWeight: 'semibold',
    fontFamily: 'Roboto-Medium',
  },
});

export default LetsStartScreen;
