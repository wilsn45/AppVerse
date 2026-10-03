import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

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

  const [showSplash, setShowSplash] =
    useState(true);

  const splashScale =
    useRef(
      new Animated.Value(0.82),
    ).current;

  const splashOpacity =
    useRef(
      new Animated.Value(1),
    ).current;

  const splashRotation =
    useRef(
      new Animated.Value(0),
    ).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(350),

      Animated.spring(
        splashScale,
        {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        },
      ),

      Animated.delay(300),

      Animated.parallel([
        Animated.timing(
          splashScale,
          {
            toValue: 18,
            duration: 650,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          splashRotation,
          {
            toValue: 1,
            duration: 650,
            useNativeDriver: true,
          },
        ),

        Animated.sequence([
          Animated.delay(350),

          Animated.timing(
            splashOpacity,
            {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            },
          ),
        ]),
      ]),
    ]).start(() => {
      setShowSplash(false);
    });
  }, [
    splashOpacity,
    splashRotation,
    splashScale,
  ]);

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

  if (
    showSplash ||
    state.status === 'loading'
  ) {
    return (
      <View style={styles.splash}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        {showSplash && (
          <Animated.Image
            source={require(
              './assets/brand/curio-mark.png'
            )}
            resizeMode="contain"
            style={[
              styles.splashLogo,
              {
                opacity:
                  splashOpacity,

                transform: [
                  {
                    scale:
                      splashScale,
                  },
                  {
                    rotate:
                      splashRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          '0deg',
                          '-7deg',
                        ],
                      }),
                  },
                ],
              },
            ]}
          />
        )}
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

        <View
          style={[
            styles.tabScreen,
            state.tab !== 'home' &&
              styles.hiddenTab,
          ]}>
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
        </View>

        <View
          style={[
            styles.tabScreen,
            state.tab !== 'curio' &&
              styles.hiddenTab,
          ]}>
          <CurioExploreScreen
            onOpenCuriosity={
              openCuriosity
            }
          />
        </View>

        <View
          style={[
            styles.tabScreen,
            state.tab !== 'saved' &&
              styles.hiddenTab,
          ]}>
          <SavedScreen
            interests={
              state.interests
            }
            onOpenCuriosity={
              openCuriosity
            }
          />
        </View>

        <View
          style={[
            styles.tabScreen,
            state.tab !== 'profile' &&
              styles.hiddenTab,
          ]}>
          <ProfileScreen
            interests={
              state.interests
            }
            onChange={
              updateInterests
            }
          />
        </View>

      </View>

      <BottomTabBar
        selected={state.tab}
        onSelect={selectTab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },

  splash: {
    flex: 1,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  splashLogo: {
    width: 92,
    height: 92,
  },

  app: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screen: {
    flex: 1,
  },

  tabScreen: {
    ...StyleSheet.absoluteFillObject,
  },

  hiddenTab: {
    display: 'none',
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      curioTheme.colors.white,
  },
});

const RootApp = () => (
  <GestureHandlerRootView
    style={styles.gestureRoot}>
    <App />
  </GestureHandlerRootView>
);

export default RootApp;
