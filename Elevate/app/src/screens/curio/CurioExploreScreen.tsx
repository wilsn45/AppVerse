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

export const CurioExploreScreen = ({
  onOpenCuriosity,
}: Props) => {
  const [items, setItems] =
    useState<Curiosity[]>([]);

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
    repository
      .getFeed()
      .then(data =>
        setItems(shuffled(data)),
      );

    refreshSaved();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 3000);

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
                    styles.imageBottom
                  }>

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
      'flex-end',
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
    alignSelf: 'flex-end',
    alignItems: 'center',

    marginBottom: 16,

    gap: 10,
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
    padding: 22,
    paddingBottom: 25,
  },

  hook: {
    fontFamily: 'Roboto-Black',

    fontSize: 31,
    lineHeight: 37,

    letterSpacing: -0.9,

    color: '#FFFFFF',

    textShadowColor:
      'rgba(0,0,0,0.35)',

    textShadowRadius: 10,
  },

  teaser: {
    marginTop: 12,

    maxWidth: '92%',

    fontFamily: 'Roboto-Regular',

    fontSize: 16,
    lineHeight: 23,

    color:
      curioTheme.colors
        .darkTextSecondary,
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
