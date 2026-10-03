import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Modal,
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

import {Swipeable} from 'react-native-gesture-handler';

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

  const [showFilters, setShowFilters] =
    useState(false);

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

        <Pressable
          style={styles.dropdown}
          onPress={() =>
            setShowFilters(true)
          }>

          <Text
            style={
              styles.dropdownText
            }>
            {filter === 'all'
              ? 'All categories'
              : filters.find(
                  item =>
                    item.id === filter,
                )?.label ??
                'All categories'}
          </Text>

          <Text
            style={
              styles.dropdownChevron
            }>
            ▾
          </Text>
        </Pressable>

        <Modal
          visible={showFilters}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setShowFilters(false)
          }>

          <Pressable
            style={styles.modalBackdrop}
            onPress={() =>
              setShowFilters(false)
            }>

            <View
              style={
                styles.dropdownMenu
              }>

              <Text
                style={
                  styles.menuTitle
                }>
                Category
              </Text>

              <Filter
                label="All categories"
                selected={
                  filter === 'all'
                }
                onPress={() => {
                  setFilter('all');
                  setShowFilters(false);
                }}
              />

              {filters.map(item => (
                <Filter
                  key={item.id}
                  label={item.label}
                  selected={
                    filter === item.id
                  }
                  onPress={() => {
                    setFilter(item.id);
                    setShowFilters(false);
                  }}
                />
              ))}

            </View>
          </Pressable>
        </Modal>

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
              <View
                key={item.id}
                style={styles.swipeContainer}>

                <Swipeable
                  overshootRight={false}
                  friction={2}
                  rightThreshold={40}
                  renderRightActions={() => (
                    <Pressable
                      style={styles.deleteAction}
                      onPress={async () => {
                        await CurioStorage
                          .toggleSaved(
                            item.id,
                          );

                        refresh();
                      }}>

                      <Text
                        style={
                          styles.deleteText
                        }>
                        Delete
                      </Text>
                    </Pressable>
                  )}>

                  <CuriosityCard
                    curiosity={item}
                    fullWidth
                    onPress={() =>
                      onOpenCuriosity(
                        item.id,
                      )
                    }
                  />

                </Swipeable>
              </View>
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

  dropdown: {
    alignSelf: 'flex-start',

    marginLeft: 20,
    marginBottom: 16,

    minHeight: 42,

    paddingLeft: 14,
    paddingRight: 12,

    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,

    backgroundColor:
      curioTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      curioTheme.colors.border,
  },

  dropdownText: {
    fontFamily: 'Roboto-Medium',

    fontSize: 14,

    color: curioTheme.colors.text,
  },

  dropdownChevron: {
    fontSize: 18,

    color:
      curioTheme.colors.primary,
  },

  modalBackdrop: {
    flex: 1,

    justifyContent: 'center',

    paddingHorizontal: 28,

    backgroundColor:
      'rgba(0,0,0,0.35)',
  },

  dropdownMenu: {
    padding: 18,

    borderRadius: 20,

    backgroundColor:
      curioTheme.colors.surface,

    gap: 8,
  },

  menuTitle: {
    marginBottom: 6,

    fontFamily: 'Roboto-Bold',

    fontSize: 18,

    color: curioTheme.colors.ink,
  },

  filter: {
    minHeight: 44,

    paddingHorizontal: 14,

    borderRadius: 12,

    justifyContent: 'center',

    backgroundColor:
      curioTheme.colors.surfaceMuted,
  },

  filterSelected: {
    backgroundColor:
      curioTheme.colors.primarySoft,
  },

  filterText: {
    fontFamily: 'Roboto-Medium',

    fontSize: 14,

    color: curioTheme.colors.text,
  },

  filterTextSelected: {
    color:
      curioTheme.colors.primary,
  },

  cards: {
    paddingHorizontal: 20,

    paddingTop: 0,
  },

  swipeContainer: {
    marginBottom: 12,

    borderRadius: 16,

    overflow: 'hidden',
  },

  deleteAction: {
    width: 92,

    marginLeft: 8,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 16,

    backgroundColor: '#D64545',
  },

  deleteText: {
    fontFamily: 'Roboto-Bold',

    fontSize: 14,

    color: '#FFFFFF',
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
