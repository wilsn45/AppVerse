import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import ProfileHandler from '../Handlers/ProfileHandler'; 
import theme from '../Theme/Theme';

const LetsStartScreen = ({ navigation }) => {
  const [name, setName] = useState('');

  const handleStart = async () => {
    if (name.trim()) {
      // Save the user's name and onboarding status (isOnboarded = true)
      await ProfileHandler.saveProfile(name, true);
      navigation.navigate('HomeTabNavigator');
    } else {
      alert('Please enter your name.');
    }
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
    fontWeight: 'semibold'
  },
});

export default LetsStartScreen;
