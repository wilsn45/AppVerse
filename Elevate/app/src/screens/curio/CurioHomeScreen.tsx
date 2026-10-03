import React, {
  useMemo,
} from 'react';

import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {INTERESTS} from '../../data/interests';
import {curioTheme} from '../../theme';

type Props = {
  interests: string[];

  onOpenCuriosity: (
    id: string,
  ) => void;

  onOpenCategory?: (
    categoryId: string,
    categoryName: string,
  ) => void;

  onSeeAllCategories?: () => void;
};

const imageForCategory = (
  topicId: string,
) => {
  const images:
    Record<string, string> = {
    psychology:
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
    space:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800',
    science:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    money:
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
    world:
      'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800',
    animals:
      'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800',
    technology:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    history:
      'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800',
    entertainment:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    internet:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    stories:
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800',
    'beautiful-things':
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    'weird-stuff':
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    'blow-my-mind':
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800',
    'whats-happening':
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800',
  };

  return (
    images[topicId] ??
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
  );
};

export const CurioHomeScreen = ({
  interests,
  onOpenCategory,
}: Props) => {
  const categories = useMemo(
    () =>
      interests
        .map(id =>
          INTERESTS.find(
            item => item.id === id,
          ),
        )
        .filter(
          (
            item,
          ): item is NonNullable<
            typeof item
          > => Boolean(item),
        ),
    [interests],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}>

        <Text style={styles.title}>
          Explore
        </Text>

        <Text style={styles.subtitle}>
          Pick something you're curious about.
        </Text>

        <View style={styles.grid}>
          {categories.map(category => (
            <Pressable
              key={category.id}
              style={({pressed}) => [
                styles.tile,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                onOpenCategory?.(
                  category.id,
                  category.label,
                )
              }>

              <ImageBackground
                source={{
                  uri: imageForCategory(
                    category.id,
                  ),
                }}
                style={styles.image}
                imageStyle={
                  styles.imageRadius
                }
                blurRadius={1.5}>

                <View
                  style={styles.overlay}
                />

                <Text
                  style={
                    styles.categoryName
                  }>
                  {category.label}
                </Text>

              </ImageBackground>
            </Pressable>
          ))}
        </View>

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

  page: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 36,
  },

  title: {
    fontFamily: 'Roboto-Black',
    fontSize: 32,
    letterSpacing: -0.8,
    color: curioTheme.colors.ink,
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 24,

    fontFamily: 'Roboto-Regular',
    fontSize: 15,

    color:
      curioTheme.colors.muted,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:
      'space-between',

    rowGap: 14,
  },

  tile: {
    width: '48%',
    aspectRatio: 1.12,

    borderRadius: 20,
    overflow: 'hidden',

    backgroundColor:
      curioTheme.colors.surfaceMuted,
  },

  pressed: {
    opacity: 0.86,
    transform: [{scale: 0.98}],
  },

  image: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  imageRadius: {
    borderRadius: 20,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      'rgba(0,0,0,0.36)',
  },

  categoryName: {
    paddingHorizontal: 12,

    textAlign: 'center',

    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    lineHeight: 22,

    color: '#FFFFFF',

    textShadowColor:
      'rgba(0,0,0,0.45)',
    textShadowRadius: 8,
  },
});
