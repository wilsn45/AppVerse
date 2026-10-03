import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import {
  captureRef,
} from 'react-native-view-shot';
import Share from 'react-native-share';

import {Curiosity} from '../../models/Curiosity';
import {MockCuriosityRepository} from '../../repositories/MockCuriosityRepository';
import {CurioStorage} from '../../services/CurioStorage';
import {curioTheme} from '../../theme';

const repository =
  new MockCuriosityRepository();

const {height: SCREEN_HEIGHT} =
  Dimensions.get('window');

type Props = {
  onOpenCuriosity: (
    id: string,
  ) => void;
};

const shuffled = <T,>(
  array: T[],
): T[] =>
  [...array].sort(
    () => Math.random() - 0.5,
  );

/*
 * Curio session state.
 *
 * This intentionally lives outside the component so opening
 * a detail screen does not destroy the current feed/session.
 *
 * It resets naturally when the app process is restarted.
 */
let cachedFeed: Curiosity[] | null = null;
let cachedScrollOffset = 0;

export const CurioExploreScreen = ({
  onOpenCuriosity,
}: Props) => {
  const [items, setItems] =
    useState<Curiosity[]>(
      cachedFeed ?? [],
    );

  const [savedIds, setSavedIds] =
    useState<Set<string>>(new Set());

  const [showSwipeHint, setShowSwipeHint] =
    useState(true);

  const viewabilityConfig =
    useRef({
      itemVisiblePercentThreshold: 70,
    }).current;

  const onViewableItemsChanged =
    useRef(() => {
      // Reserved for future analytics / prefetching.
    }).current;

  const bounce =
    useRef(
      new Animated.Value(0),
    ).current;

  const cardRefs =
    useRef<Record<string, View | null>>(
      {},
    );

  const shareCuriosity = async (
    item: Curiosity,
  ) => {
    const card = cardRefs.current[item.id];

    if (!card) {
      return;
    }

    try {
      const uri = await captureRef(card, {
        format: 'jpg',
        quality: 0.9,
        result: 'tmpfile',
      });

      await Share.open({
        title: item.hook,
        message:
          `${item.hook}\n\n${item.teaser}`,
        url: uri,
        type: 'image/jpeg',
        failOnCancel: false,
      });
    } catch {
      // Sharing is optional. Keep browsing if
      // capture/share is unavailable.
    }
  };

  useEffect(() => {
    if (!cachedFeed) {
      repository
        .getFeed()
        .then(data => {
          const feed =
            shuffled(data);

          cachedFeed = feed;
          setItems(feed);
        });
    }

    refreshSaved();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const animation =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            bounce,
            {
              toValue: -9,
              duration: 520,
              useNativeDriver: true,
            },
          ),

          Animated.timing(
            bounce,
            {
              toValue: 0,
              duration: 520,
              useNativeDriver: true,
            },
          ),
        ]),
      );

    animation.start();

    return () =>
      animation.stop();
  }, [bounce]);

  const refreshSaved = async () => {
    const saved =
      await CurioStorage.getSaved();

    setSavedIds(
      new Set(
        saved.map(item => item.id),
      ),
    );
  };

  const toggleSave = async (
    id: string,
  ) => {
    await CurioStorage
      .toggleSaved(id);

    refreshSaved();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={
          curioTheme.colors.black
        }
      />

      <FlatList
        data={items}
        keyExtractor={item => item.id}

        contentOffset={{
          x: 0,
          y: cachedScrollOffset,
        }}

        onScroll={event => {
          cachedScrollOffset =
            event.nativeEvent
              .contentOffset.y;
        }}

        scrollEventThrottle={16}

        pagingEnabled

        showsVerticalScrollIndicator={
          false
        }

        decelerationRate="fast"

        bounces={false}

        overScrollMode="never"

        removeClippedSubviews

        initialNumToRender={2}

        maxToRenderPerBatch={3}

        windowSize={5}

        viewabilityConfig={
          viewabilityConfig
        }

        onViewableItemsChanged={
          onViewableItemsChanged
        }

        renderItem={({item}) => (
          <View style={styles.cardPage}>
            <View
              style={styles.card}
              ref={ref => {
                cardRefs.current[item.id] =
                  ref;
              }}
              collapsable={false}>
              <Pressable
                style={styles.card}
              onPress={() =>
                onOpenCuriosity(
                  item.id,
                )
              }>

              <ImageBackground
                source={{
                  uri: item.imageUrl,
                }}
                style={styles.image}
                imageStyle={
                  styles.imageStyle
                }>

                <View
                  style={
                    styles.imageShade
                  }
                />

                <View
                  style={
                    styles.actionStack
                  }>

                  <Pressable
                    hitSlop={10}
                    onPress={event => {
                      event.stopPropagation();

                      toggleSave(
                        item.id,
                      );
                    }}
                    style={
                      styles.actionButton
                    }>

                    <Icon
                      name={
                        savedIds.has(
                          item.id,
                        )
                          ? 'bookmark'
                          : 'bookmark-outline'
                      }
                      size={23}
                      color="#FFFFFF"
                    />
                  </Pressable>

                  <Pressable
                    hitSlop={10}
                    onPress={event => {
                      event.stopPropagation();

                      shareCuriosity(
                        item,
                      );
                    }}
                    style={
                      styles.actionButton
                    }>

                    <Icon
                      name="share-social-outline"
                      size={23}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>


                <View
                  style={
                    styles.imageBottom
                  }>

                  <Text
                    style={styles.hook}>
                    {item.hook}
                  </Text>

                  <Text
                    style={
                      styles.teaser
                    }>
                    {item.teaser}
                  </Text>
                </View>

                {showSwipeHint && (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.swipeArrow,
                      {
                        transform: [
                          {
                            translateY:
                              bounce,
                          },
                        ],
                      },
                    ]}>

                    <Icon
                      name="chevron-up"
                      size={28}
                      color="#FFFFFF"
                    />
                  </Animated.View>
                )}
              </ImageBackground>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,

    backgroundColor:
      curioTheme.colors.black,
  },

  cardPage: {
    height:
      SCREEN_HEIGHT - 72,

    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  card: {
    flex: 1,

    borderRadius: 28,

    overflow: 'hidden',

    backgroundColor:
      curioTheme.colors.darkSurface,
  },

  image: {
    flex: 1,

    justifyContent:
      'center',
  },

  imageStyle: {
    borderRadius: 28,
  },

  imageShade: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      curioTheme.colors.darkOverlay,
  },

  actionStack: {
    position: 'absolute',

    right: 18,
    bottom: 18,

    alignItems: 'center',

    gap: 10,

    zIndex: 5,
  },

  actionButton: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor:
      'rgba(0,0,0,0.38)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  imageBottom: {
    paddingHorizontal: 26,
    paddingVertical: 32,

    alignItems: 'center',
    justifyContent: 'center',
  },

  hook: {
    fontFamily: 'Roboto-Black',

    fontSize: 31,
    lineHeight: 37,

    letterSpacing: -0.9,

    color: '#FFFFFF',

    textAlign: 'center',

    textShadowColor:
      'rgba(0,0,0,0.35)',

    textShadowRadius: 10,
  },

  teaser: {
    marginTop: 18,

    maxWidth: '94%',

    fontFamily: 'Roboto-Regular',

    fontSize: 17,
    lineHeight: 25,

    textAlign: 'center',

    color: '#FFFFFF',

    textShadowColor:
      'rgba(0,0,0,0.45)',

    textShadowRadius: 8,
  },

  swipeArrow: {
    position: 'absolute',

    bottom: 14,
    left: '50%',
    marginLeft: -23,

    width: 46,
    height: 46,

    borderRadius: 23,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      curioTheme.colors.darkControl,

    zIndex: 10,
  },
});
