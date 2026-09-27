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

  useEffect(() => {
    repository
      .getFeed()
      .then(data =>
        setItems(shuffled(data)),
      );

    refreshSaved();
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

      <View style={styles.topBar}>
        <View style={styles.brandMark}>
          <Text style={styles.brandC}>
            C
          </Text>
        </View>

        <Text style={styles.brand}>
          Curio
        </Text>
      </View>

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

        onScrollBeginDrag={() =>
          setShowSwipeHint(false)
        }

        renderItem={({item}) => (
          <View style={styles.cardPage}>
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
                    styles.imageTop
                  }>

                  <View
                    style={
                      styles.topicPill
                    }>

                    <Text
                      style={
                        styles.topic
                      }>
                      {item.topic}
                    </Text>
                  </View>

                  <Pressable
                    hitSlop={14}

                    onPress={event => {
                      event.stopPropagation();

                      toggleSave(
                        item.id,
                      );
                    }}

                    style={styles.save}>

                    <Icon
                      name={
                        savedIds.has(
                          item.id,
                        )
                          ? 'bookmark'
                          : 'bookmark-outline'
                      }
                      size={22}
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

                  <View
                    style={
                      styles.footer
                    }>

                    <View
                      style={
                        styles.exploreButton
                      }>

                      <Text
                        style={
                          styles.exploreText
                        }>
                        Explore this
                      </Text>

                      <Icon
                        name="arrow-forward"
                        size={17}
                        color="#FFFFFF"
                      />
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
                  </View>
                </View>
              </ImageBackground>
            </Pressable>
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

  topBar: {
    height: 72,

    paddingHorizontal: 18,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor:
      curioTheme.colors.black,
  },

  brandMark: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor:
      curioTheme.colors.primary,

    alignItems: 'center',
    justifyContent: 'center',

    transform: [
      {rotate: '-7deg'},
    ],
  },

  brandC: {
    fontFamily: 'Roboto-Black',

    fontSize: 19,

    color: '#FFFFFF',
  },

  brand: {
    marginLeft: 10,

    fontFamily: 'Roboto-Black',

    fontSize: 20,

    color: '#FFFFFF',
  },

  cardPage: {
    height:
      SCREEN_HEIGHT - 144,

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
      'space-between',
  },

  imageStyle: {
    borderRadius: 28,
  },

  imageShade: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      curioTheme.colors.darkOverlay,
  },

  imageTop: {
    padding: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  topicPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,

    borderRadius: 15,

    backgroundColor:
      curioTheme.colors.primary,
  },

  topic: {
    fontFamily: 'Roboto-Bold',

    fontSize: 11,

    letterSpacing: 0.6,

    textTransform:
      'uppercase',

    color: '#FFFFFF',
  },

  save: {
    width: 43,
    height: 43,

    borderRadius: 22,

    backgroundColor:
      'rgba(0,0,0,0.30)',

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

  footer: {
    marginTop: 24,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  exploreButton: {
    height: 45,

    paddingHorizontal: 16,

    borderRadius: 23,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,

    backgroundColor:
      curioTheme.colors.primary,
  },

  exploreText: {
    fontFamily: 'Roboto-Bold',

    fontSize: 14,

    color: '#FFFFFF',
  },

  swipeArrow: {
    width: 46,
    height: 46,

    borderRadius: 23,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      curioTheme.colors.darkControl,
  },
});
