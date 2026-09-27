import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
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
  onBack: () => void;
  onOpenCuriosity: (
    id: string,
  ) => void;
};

const repository =
  new MockCuriosityRepository();

export const CuriosityDetailScreen = ({
  curiosityId,
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

        const children =
          await repository
            .getRelatedCuriosities(
              curiosity,
            );

        setRelated(children);

        CurioStorage.addSeenId(
          curiosity.id,
        );

        setSaved(
          await CurioStorage.isSaved(
            curiosity.id,
          ),
        );
      });
  }, [curiosityId]);

  if (!item) {
    return (
      <SafeAreaView
        style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator
            color={
              curioTheme.colors.primary
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const toggleSave = async () => {
    setSaved(
      await CurioStorage.toggleSaved(
        item.id,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topSpacer} />

      <View style={styles.nav}>
        <Pressable
          onPress={onBack}
          hitSlop={14}
          style={styles.navButton}>

          <Icon
            name="chevron-back"
            size={26}
            color={
              curioTheme.colors.primary
            }
          />
        </Pressable>

        <Pressable
          onPress={toggleSave}
          hitSlop={14}
          style={styles.navButton}>

          <Icon
            name={
              saved
                ? 'bookmark'
                : 'bookmark-outline'
            }
            size={21}
            color={
              curioTheme.colors.primary
            }
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }>

        <Image
          source={{
            uri: item.imageUrl,
          }}
          style={styles.hero}
        />

        <Text style={styles.topic}>
          {item.topic.toUpperCase()}
        </Text>

        <Text style={styles.title}>
          {item.title}
        </Text>

        <Text style={styles.summary}>
          {item.summary}
        </Text>

        {!!related.length && (
          <View style={styles.relatedArea}>
            <Text
              style={
                styles.exploreTitle
              }>
              Go deeper
            </Text>

            <Text
              style={
                styles.exploreSubtitle
              }>
              Keep following this
              curiosity
            </Text>

            {related.map(
              (next, index) => (
                <Pressable
                  key={next.id}
                  onPress={() =>
                    onOpenCuriosity(
                      next.id,
                    )
                  }
                  style={styles.related}>

                  <View
                    style={
                      styles.relatedNumber
                    }>
                    <Text
                      style={
                        styles.relatedNumberText
                      }>
                      {index + 1}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.relatedText
                    }>
                    {next.hook}
                  </Text>

                  <Icon
                    name="chevron-forward"
                    size={19}
                    color={
                      curioTheme.colors
                        .primary
                    }
                  />
                </Pressable>
              ),
            )}
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

  topSpacer: {
    height: 22,
  },

  loading: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  nav: {
    height: 54,

    paddingHorizontal: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  navButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      curioTheme.colors.primarySoft,
  },

  content: {
    paddingHorizontal: 20,

    paddingTop: 15,
    paddingBottom: 60,
  },

  hero: {
    width: '100%',
    height: 205,

    borderRadius: 24,

    marginBottom: 25,

    backgroundColor:
      curioTheme.colors.surfaceMuted,
  },

  topic: {
    fontFamily: 'Roboto-Bold',

    fontSize: 11,

    letterSpacing: 0.9,

    color:
      curioTheme.colors.primary,

    marginBottom: 12,
  },

  title: {
    fontFamily: 'Roboto-Black',

    fontSize: 30,
    lineHeight: 37,

    letterSpacing: -0.8,

    color: curioTheme.colors.ink,
  },

  summary: {
    marginTop: 20,

    fontFamily: 'Roboto-Regular',

    fontSize: 17,
    lineHeight: 27,

    color: curioTheme.colors.text,
  },

  relatedArea: {
    marginTop: 40,
  },

  exploreTitle: {
    fontFamily: 'Roboto-Black',

    fontSize: 22,

    color: curioTheme.colors.ink,
  },

  exploreSubtitle: {
    marginTop: 3,
    marginBottom: 12,

    fontFamily: 'Roboto-Regular',

    fontSize: 13,

    color: curioTheme.colors.muted,
  },

  related: {
    minHeight: 76,

    flexDirection: 'row',
    alignItems: 'center',

    borderTopWidth: 1,

    borderTopColor:
      curioTheme.colors.border,
  },

  relatedNumber: {
    width: 30,
    height: 30,

    borderRadius: 15,

    marginRight: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      curioTheme.colors.primarySoft,
  },

  relatedNumberText: {
    fontFamily: 'Roboto-Bold',

    fontSize: 12,

    color:
      curioTheme.colors.primary,
  },

  relatedText: {
    flex: 1,

    marginRight: 10,

    fontFamily: 'Roboto-Medium',

    fontSize: 15,
    lineHeight: 21,

    color: curioTheme.colors.ink,
  },
});
