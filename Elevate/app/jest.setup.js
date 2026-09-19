jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  multiSet: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-firebase/functions', () => () => ({
  httpsCallable: jest.fn(() => jest.fn(() => Promise.reject(new Error('offline test')))),
}));

jest.mock('@react-native-firebase/analytics', () => () => ({
  logEvent: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
