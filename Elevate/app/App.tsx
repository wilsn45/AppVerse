import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import {InterestSelectionScreen} from './src/screens/InterestSelectionScreen';
import {FeedScreen} from './src/screens/FeedScreen';
import {CurioStorage} from './src/services/CurioStorage';
import {CurioAnalytics} from './src/services/CurioAnalytics';
import {curioTheme} from './src/theme';

type AppState =
  | {status: 'loading'}
  | {status: 'onboarding'}
  | {status: 'feed'; interests: string[]};

const App = () => {
  const [state, setState] = useState<AppState>({status: 'loading'});

  useEffect(() => {
    const bootstrap = async () => {
      const [onboarded, interests] = await Promise.all([
        CurioStorage.isOnboarded(),
        CurioStorage.getInterests(),
      ]);

      setState(
        onboarded
          ? {status: 'feed', interests}
          : {status: 'onboarding'},
      );
    };

    bootstrap().catch(() => {
      setState({status: 'onboarding'});
    });
  }, []);

  const completeOnboarding = async (interests: string[]) => {
    await CurioStorage.completeOnboarding(interests);

    CurioAnalytics.onboardingCompleted(interests.length);

    setState({
      status: 'feed',
      interests,
    });
  };

  if (state.status === 'loading') {
    return (
      <View style={styles.loading}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={curioTheme.colors.canvas}
        />
        <ActivityIndicator color={curioTheme.colors.purple} />
      </View>
    );
  }

  if (state.status === 'onboarding') {
    return (
      <InterestSelectionScreen
        onComplete={completeOnboarding}
      />
    );
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={curioTheme.colors.white}
      />

      <FeedScreen interests={state.interests} />
    </>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: curioTheme.colors.canvas,
  },
});

export default App;