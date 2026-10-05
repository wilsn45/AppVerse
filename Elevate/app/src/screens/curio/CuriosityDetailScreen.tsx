import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
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

type Props = {
  curiosityId: string;
  isDeeperDetail?: boolean;
  onBack: () => void;
  onOpenCuriosity: (
    id: string,
  ) => void;
};

const repository =
  new MockCuriosityRepository();

export const CuriosityDetailScreen = ({
  curiosityId,
  isDeeperDetail = false,
  onBack,
  onOpenCuriosity,
}: Props) => {
  const [item, setItem] =
    useState<Curiosity>();

  const [related, setRelated] =
    useState<Curiosity[]>([]);

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    setItem(undefined);
    setRelated([]);

    repository
      .getCuriosity(curiosityId)
      .then(async curiosity => {
        setItem(curiosity);

        if (!curiosity) {
          return;
        }

        setRelated(
          await repository
            .getRelatedCuriosities(
              curiosity,
            ),
        );

        await CurioStorage
          .addSeenId(
            curiosity.id,
          );

        setSaved(
          await CurioStorage
            .isSaved(
              curiosity.id,
            ),
        );
      });
  }, [curiosityId]);

  const toggleSave =
    async () => {
      if (!item) {
        return;
      }

      setSaved(
        await CurioStorage
          .toggleSaved(
            item.id,
          ),
      );
    };

  if (!item) {
    return (
      <SafeAreaView
        style={styles.safe}>

        <StatusBar
          barStyle="dark-content"
          backgroundColor={
            curioTheme.colors.canvas
          }
        />

        <View style={styles.loading}>
          <ActivityIndicator
            color={
              curioTheme.colors.brand
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  // Image is allowed ONLY on the first detail opened
  // directly from a card. Once the user follows Keep Going,
  // every subsequent detail is text-only.
  const hasImage =
    !isDeeperDetail &&
    Boolean(item.visual.url);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          curioTheme.colors.canvas
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.page,
          !hasImage &&
            styles.plainPage,
        ]}>

        {/* ===============================================
            ROOT ITEM WITH IMAGE
           =============================================== */}

        {hasImage ? (
          <View style={styles.mainCard}>
            <ImageBackground
              source={{
                uri: item.visual.url,
              }}
              style={styles.hero}
              imageStyle={
                styles.heroImage
              }>

              <View
                style={
                  styles.heroOverlay
                }
              />

              <View style={styles.nav}>
                <Pressable
                  onPress={onBack}
                  hitSlop={14}
                  style={
                    styles.imageNavButton
                  }>

                  <Icon
                    name="chevron-back"
                    size={27}
                    color="#FFFFFF"
                  />
                </Pressable>

                <Pressable
                  onPress={toggleSave}
                  hitSlop={14}
                  style={
                    styles.imageNavButton
                  }>

                  <Icon
                    name={
                      saved
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
                  styles.heroContent
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

                <Text
                  style={
                    styles.imageTitle
                  }>
                  {item.hook}
                </Text>
              </View>
            </ImageBackground>

            <View style={styles.answer}>
              <Text
                style={
                  styles.answerText
                }>
                {item.explanation}
              </Text>
            </View>
          </View>
        ) : (

          /* =============================================
             DEEPER ITEM WITHOUT IMAGE
             No placeholder.
             ============================================= */

          <>
            <View style={styles.plainNav}>
              <Pressable
                onPress={onBack}
                hitSlop={14}
                style={
                  styles.plainNavButton
                }>

                <Icon
                  name="chevron-back"
                  size={25}
                  color={
                    curioTheme.colors
                      .primary
                  }
                />
              </Pressable>

              <Pressable
                onPress={toggleSave}
                hitSlop={14}
                style={
                  styles.plainNavButton
                }>

                <Icon
                  name={
                    saved
                      ? 'bookmark'
                      : 'bookmark-outline'
                  }
                  size={20}
                  color={
                    curioTheme.colors.primary
                  }
                />
              </Pressable>
            </View>

            <View
              style={
                styles.plainContent
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

              <Text
                style={
                  styles.plainTitle
                }>
                {item.hook}
              </Text>

              <Text
                style={
                  styles.plainAnswer
                }>
                {item.explanation}
              </Text>
            </View>
          </>
        )}


        {/* ===============================================
            KEEP GOING
            Deliberately understated.
           =============================================== */}

        {!!related.length && (
          <View
            style={
              styles.keepGoing
            }>

            <Text
              style={
                styles.keepGoingTitle
              }>
              Keep going
            </Text>

            {related.map(next => (
              <Pressable
                key={next.id}
                hitSlop={5}
                onPress={() =>
                  onOpenCuriosity(
                    next.id,
                  )
                }
                style={({pressed}) => [
                  styles.relatedItem,
                  pressed &&
                    styles.relatedPressed,
                ]}>

                <Text
                  style={
                    styles.relatedText
                  }>
                  {next.hook}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safe: {
    flex: 1,

    backgroundColor:
      curioTheme.colors.canvas,
  },

  loading: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      curioTheme.colors.canvas,
  },

  page: {
    paddingTop: 20,
    paddingBottom: 55,
  },

  plainPage: {
    paddingTop: 20,
  },


  // ======================================================
  // MAIN CURIOSITY
  // ======================================================

  mainCard: {
    marginHorizontal: 14,

    overflow: 'hidden',

    borderRadius: 28,

    backgroundColor:
      curioTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      curioTheme.colors.border,
  },

  hero: {
    height: 390,

    justifyContent:
      'space-between',
  },

  heroImage: {
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      'rgba(0,0,0,0.30)',
  },

  nav: {
    paddingHorizontal: 15,
    paddingTop: 16,

    flexDirection: 'row',

    justifyContent:
      'space-between',
  },

  imageNavButton: {
    width: 43,
    height: 43,

    borderRadius: 22,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(0,0,0,0.28)',
  },

  heroContent: {
    paddingHorizontal: 21,
    paddingBottom: 24,
  },

  topicPill: {
    alignSelf:
      'flex-start',

    paddingHorizontal: 10,
    paddingVertical: 5,

    marginBottom: 11,

    borderRadius: 11,

    backgroundColor:
      curioTheme.colors.brand,
  },

  topic: {
    fontFamily:
      'Roboto-Bold',

    fontSize: 10,

    letterSpacing: 0.6,

    textTransform:
      'uppercase',

    color: '#FFFFFF',
  },

  imageTitle: {
    maxWidth: '96%',

    fontFamily:
      'Roboto-Black',

    fontSize: 29,
    lineHeight: 35,

    letterSpacing: -0.7,

    color: '#FFFFFF',

    textShadowColor:
      'rgba(0,0,0,0.40)',

    textShadowRadius: 8,
  },

  answer: {
    paddingHorizontal: 21,

    paddingTop: 19,
    paddingBottom: 23,

    backgroundColor:
      curioTheme.colors.surface,
  },

  answerText: {
    fontFamily:
      'Roboto-Regular',

    fontSize: 20,
    lineHeight: 31,

    color:
      curioTheme.colors
        .textSecondary,
  },


  // ======================================================
  // IMAGELESS DEEPER DETAIL
  // ======================================================

  plainNav: {
    paddingHorizontal: 18,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',
  },

  plainNavButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      curioTheme.colors
        .primarySoft,
  },

  plainContent: {
    paddingHorizontal: 23,

    paddingTop: 16,
  },

  plainTitle: {
    maxWidth: '96%',

    fontFamily:
      'Roboto-Black',

    fontSize: 29,
    lineHeight: 36,

    letterSpacing: -0.7,

    color:
      curioTheme.colors.ink,
  },

  plainAnswer: {
    marginTop: 20,

    fontFamily:
      'Roboto-Regular',

    fontSize: 20,
    lineHeight: 31,

    color:
      curioTheme.colors
        .textSecondary,
  },


  // ======================================================
  // KEEP GOING
  // ======================================================

  keepGoing: {
    marginTop: 30,

    paddingHorizontal: 23,
  },

  keepGoingTitle: {
    marginBottom: 7,

    fontFamily:
      'Roboto-Medium',

    fontSize: 15,

    color:
      curioTheme.colors.muted,
  },

  relatedItem: {
    paddingVertical: 11,
  },

  relatedPressed: {
    opacity: 0.5,
  },

  relatedText: {
    fontFamily:
      'Roboto-Regular',

    fontSize: 16,
    lineHeight: 22,

    color:
      curioTheme.colors.primary,
  },
});
