import React, {
  useEffect,
  useState,
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

import Icon from 'react-native-vector-icons/Ionicons';

import {Curiosity} from '../../models/Curiosity';
import {MockCuriosityRepository} from '../../repositories/MockCuriosityRepository';
import {curioTheme} from '../../theme';

const repository =
  new MockCuriosityRepository();

type Props = {
  interests: string[];
  categoryId: string;
  categoryName: string;
  onBack: () => void;
  onOpenCuriosity: (
    id: string,
  ) => void;
};

export const CategoryScreen = ({
  categoryId,
  categoryName,
  onBack,
  onOpenCuriosity,
}: Props) => {
  const [items, setItems] =
    useState<Curiosity[]>([]);

  useEffect(() => {
    repository
      .getByTopic(categoryId)
      .then(setItems);
  }, [categoryId]);

  return (
    <SafeAreaView style={styles.safe}>

      <View style={styles.nav}>
        <Pressable
          onPress={onBack}
          hitSlop={14}
          style={styles.back}>

          <Icon
            name="chevron-back"
            size={25}
            color={
              curioTheme.colors.primary
            }
          />
        </Pressable>

        <Text style={styles.navTitle}>
          {categoryName}
        </Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }>

        <View style={styles.grid}>
          {items.map(item => (
            <Pressable
              key={item.id}
              style={({pressed}) => [
                styles.card,
                pressed &&
                  styles.cardPressed,
              ]}
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
                  styles.imageRadius
                }>

                <View
                  style={
                    styles.overlay
                  }
                />

                <Text
                  numberOfLines={5}
                  style={
                    styles.question
                  }>
                  {item.hook}
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
    backgroundColor: '#FFFFFF',
  },

  nav: {
    height: 64,
    marginTop: 8,
    paddingHorizontal: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  back: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor:
      curioTheme.colors.primarySoft,

    alignItems: 'center',
    justifyContent: 'center',
  },

  navTitle: {
    flex: 1,

    paddingHorizontal: 10,

    textAlign: 'center',

    fontFamily: 'Roboto-Bold',
    fontSize: 18,

    color: curioTheme.colors.ink,
  },

  placeholder: {
    width: 42,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent:
      'space-between',

    rowGap: 12,
  },

  card: {
    width: '48.4%',
    aspectRatio: 1,

    borderRadius: 18,
    overflow: 'hidden',

    backgroundColor:
      curioTheme.colors.surfaceMuted,
  },

  cardPressed: {
    opacity: 0.86,
    transform: [{scale: 0.98}],
  },

  image: {
    flex: 1,

    justifyContent: 'flex-end',

    padding: 14,
  },

  imageRadius: {
    borderRadius: 18,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      'rgba(0,0,0,0.35)',
  },

  question: {
    fontFamily: 'Roboto-Bold',

    fontSize: 16,
    lineHeight: 20,

    color: '#FFFFFF',

    textShadowColor:
      'rgba(0,0,0,0.45)',

    textShadowRadius: 7,
  },
});
