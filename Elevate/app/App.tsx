import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import {InterestSelectionScreen} from './src/screens/InterestSelectionScreen';

import {CurioHomeScreen} from './src/screens/curio/CurioHomeScreen';
import {CurioExploreScreen} from './src/screens/curio/CurioExploreScreen';
import {CuriosityDetailScreen} from './src/screens/curio/CuriosityDetailScreen';
import {CategoryScreen} from './src/screens/curio/CategoryScreen';
import {SavedScreen} from './src/screens/curio/SavedScreen';
import {ProfileScreen} from './src/screens/curio/ProfileScreen';

import {
  BottomTabBar,
  CurioTab,
} from './src/components/curio/BottomTabBar';

import {CurioStorage} from './src/services/CurioStorage';
import {CurioAnalytics} from './src/services/CurioAnalytics';
import {curioTheme} from './src/theme';

type AppState =
  | {
      status: 'loading';
    }
  | {
      status: 'onboarding';
    }
  | {
      status: 'main';
      interests: string[];
      tab: CurioTab;
    }
  | {
      status: 'detail';
      interests: string[];
      curiosityId: string;
      returnTab: CurioTab;
      history: string[];
    }
  | {
      status: 'category';
      interests: string[];
      categoryId: string;
      categoryName: string;
    };

const App = () => {
  const [state, setState] =
    useState<AppState>({
      status: 'loading',
    });

  useEffect(() => {
    Promise.all([
      CurioStorage.isOnboarded(),
      CurioStorage.getInterests(),
    ])
      .then(([onboarded, interests]) => {
        setState(
          onboarded
            ? {
                status: 'main',
                interests,
                tab: 'curio',
              }
            : {
                status: 'onboarding',
              },
        );
      })
      .catch(() =>
        setState({
          status: 'onboarding',
        }),
      );
  }, []);

  const completeOnboarding = async (
    interests: string[],
  ) => {
    await CurioStorage.completeOnboarding(
      interests,
    );

    CurioAnalytics.onboardingCompleted(
      interests.length,
    );

    setState({
      status: 'main',
      interests,
      tab: 'curio',
    });
  };

  if (state.status === 'loading') {
    return (
      <View style={styles.loading}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <ActivityIndicator
          color={curioTheme.colors.brand}
        />
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

  if (state.status === 'detail') {
    const openRelated = (id: string) => {
      setState({
        ...state,
        curiosityId: id,
        history: [
          ...state.history,
          state.curiosityId,
        ],
      });
    };

    const goBack = () => {
      if (state.history.length) {
        const history = [
          ...state.history,
        ];

        const previous =
          history.pop()!;

        setState({
          ...state,
          curiosityId: previous,
          history,
        });

        return;
      }

      setState({
        status: 'main',
        interests: state.interests,
        tab: state.returnTab,
      });
    };

    return (
      <>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <CuriosityDetailScreen
          curiosityId={
            state.curiosityId
          }
          isDeeperDetail={
            state.history.length > 0
          }
          onBack={goBack}
          onOpenCuriosity={
            openRelated
          }
        />
      </>
    );
  }

  if (state.status === 'category') {
    return (
      <>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <CategoryScreen
          interests={
            state.interests
          }
          categoryId={
            state.categoryId
          }
          categoryName={
            state.categoryName
          }
          onBack={() =>
            setState({
              status: 'main',
              interests:
                state.interests,
              tab: 'home',
            })
          }
          onOpenCuriosity={id =>
            setState({
              status: 'detail',
              interests:
                state.interests,
              curiosityId: id,
              returnTab: 'home',
              history: [],
            })
          }
        />
      </>
    );
  }

  const openCuriosity = (
    id: string,
  ) => {
    setState({
      status: 'detail',
      interests: state.interests,
      curiosityId: id,
      returnTab: state.tab,
      history: [],
    });
  };

  const selectTab = (
    tab: CurioTab,
  ) => {
    setState({
      ...state,
      tab,
    });
  };

  const updateInterests =
    async (interests: string[]) => {
      await CurioStorage.setInterests(
        interests,
      );

      setState({
        ...state,
        interests,
      });
    };

  return (
    <View style={styles.app}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.screen}>
        {state.tab === 'home' && (
          <CurioHomeScreen
            interests={
              state.interests
            }
            onOpenCuriosity={
              openCuriosity
            }
            onOpenCategory={(
              categoryId,
              categoryName,
            ) =>
              setState({
                status:
                  'category',
                interests:
                  state.interests,
                categoryId,
                categoryName,
              })
            }
            onSeeAllCategories={() =>
              setState({
                status: 'category',
                interests:
                  state.interests,
                categoryId: '__all__',
                categoryName:
                  'All Categories',
              })
            }
          />
        )}

        {state.tab === 'curio' && (
          <CurioExploreScreen
            onOpenCuriosity={
              openCuriosity
            }
          />
        )}

        {state.tab === 'saved' && (
          <SavedScreen
            interests={
              state.interests
            }
            onOpenCuriosity={
              openCuriosity
            }
          />
        )}

        {state.tab === 'profile' && (
          <ProfileScreen
            interests={
              state.interests
            }
            onChange={
              updateInterests
            }
          />
        )}
      </View>

      <BottomTabBar
        selected={state.tab}
        onSelect={selectTab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screen: {
    flex: 1,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      curioTheme.colors.white,
  },
});

export default App;
