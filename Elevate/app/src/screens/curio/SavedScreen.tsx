import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {CuriosityCard} from '../../components/curio/CuriosityCard';
import {Curiosity} from '../../models/Curiosity';
import {mockCuriosities} from '../../data/mock/curiosities';
import {INTERESTS} from '../../data/interests';
import {
  CurioStorage,
  SavedCuriosity,
} from '../../services/CurioStorage';

import {curioTheme} from '../../theme';

type Props = {
  interests: string[];
  onOpenCuriosity: (
    id: string,
  ) => void;
};

export const SavedScreen = ({
  interests,
  onOpenCuriosity,
}: Props) => {
  const [saved, setSaved] =
    useState<SavedCuriosity[]>([]);

  const [filter, setFilter] =
    useState('all');

  const refresh = () =>
    CurioStorage
      .getSaved()
      .then(setSaved);

  useEffect(() => {
    refresh();
  }, []);

  const items = useMemo(
    () =>
      saved
        .slice()
        .sort(
          (a, b) =>
            b.savedAt - a.savedAt,
        )
        .map(entry =>
          mockCuriosities.find(
            item =>
              item.id === entry.id,
          ),
        )
        .filter(
          (
            item,
          ): item is Curiosity =>
            Boolean(item),
        )
        .filter(
          item =>
            filter === 'all' ||
            item.topicId === filter,
        ),
    [saved, filter],
  );

  const filters = interests
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
    );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.page
        }>

        <Text style={styles.title}>
          Saved
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filters
          }>

          <Filter
            label="All"
            selected={
              filter === 'all'
            }
            onPress={() =>
              setFilter('all')
            }
          />

          {filters.map(item => (
            <Filter
              key={item.id}
              label={item.label}
              selected={
                filter === item.id
              }
              onPress={() =>
                setFilter(item.id)
              }
            />
          ))}
        </ScrollView>

        <View style={styles.cards}>
          {!items.length ? (
            <View style={styles.empty}>
              <Text
                style={
                  styles.emptyTitle
                }>
                Nothing saved yet
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                Tap the bookmark on
                anything you want to
                come back to.
              </Text>
            </View>
          ) : (
            items.map(item => (
              <CuriosityCard
                key={item.id}
                curiosity={item}
                fullWidth
                saved
                onPress={() =>
                  onOpenCuriosity(
                    item.id,
                  )
                }
                onSave={async () => {
                  await CurioStorage
                    .toggleSaved(
                      item.id,
                    );

                  refresh();
                }}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Filter = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.filter,
      selected &&
        styles.filterSelected,
    ]}>

    <Text
      style={[
        styles.filterText,
        selected &&
          styles.filterTextSelected,
      ]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,

    backgroundColor:
      curioTheme.colors.canvas,
  },

  page: {
    paddingTop: 40,
    paddingBottom: 30,
  },

  title: {
    paddingHorizontal: 20,

    fontFamily: 'Roboto-Black',

    fontSize: 30,

    letterSpacing: -0.7,

    color: curioTheme.colors.ink,

    marginBottom: 15,
  },

  filters: {
    paddingHorizontal: 20,

    gap: 8,

    paddingBottom: 12,
  },

  filter: {
    height: 34,

    paddingHorizontal: 14,

    borderRadius: 17,

    justifyContent: 'center',

    backgroundColor:
      curioTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      curioTheme.colors.border,
  },

  filterSelected: {
    backgroundColor:
      curioTheme.colors.primary,

    borderColor:
      curioTheme.colors.primary,
  },

  filterText: {
    fontFamily: 'Roboto-Medium',

    fontSize: 12,

    color: curioTheme.colors.text,
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  cards: {
    paddingHorizontal: 20,

    paddingTop: 0,
  },

  empty: {
    paddingTop: 65,

    paddingHorizontal: 30,

    alignItems: 'center',
  },

  emptyTitle: {
    fontFamily: 'Roboto-Bold',

    fontSize: 20,

    color: curioTheme.colors.ink,
  },

  emptyText: {
    marginTop: 8,

    textAlign: 'center',

    fontFamily: 'Roboto-Regular',

    fontSize: 15,
    lineHeight: 22,

    color: curioTheme.colors.muted,
  },
});
