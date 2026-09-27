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

import Icon from 'react-native-vector-icons/Ionicons';

import {CurioLogo} from '../../components/curio/CurioLogo';
import {CategoryCard} from '../../components/curio/CategoryCard';
import {CuriosityCard} from '../../components/curio/CuriosityCard';

import {Curiosity} from '../../models/Curiosity';

import {MockCuriosityRepository} from '../../repositories/MockCuriosityRepository';

import {CurioStorage} from '../../services/CurioStorage';

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

const repository =
  new MockCuriosityRepository();


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


const SectionHeader = ({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>
      {title}
    </Text>

    {!!action && (
      <Pressable
        onPress={onAction}
        hitSlop={10}
        style={styles.seeAll}>

        <Text style={styles.seeAllText}>
          {action}
        </Text>

        <Icon
          name="chevron-forward"
          size={16}
          color={
            curioTheme.colors.primary
          }
        />
      </Pressable>
    )}
  </View>
);


const CuriosityRail = ({
  items,
  savedIds,
  onOpen,
  onSave,
}: {
  items: Curiosity[];
  savedIds: Set<string>;
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={
      false
    }
    contentContainerStyle={
      styles.rail
    }>

    {items.map(item => (
      <CuriosityCard
        key={item.id}
        curiosity={item}
        saved={savedIds.has(item.id)}
        onPress={() =>
          onOpen(item.id)
        }
        onSave={() =>
          onSave(item.id)
        }
      />
    ))}
  </ScrollView>
);


export const CurioHomeScreen = ({
  interests,
  onOpenCuriosity,
  onOpenCategory,
  onSeeAllCategories,
}: Props) => {

  const [items, setItems] =
    useState<Curiosity[]>([]);

  const [savedIds, setSavedIds] =
    useState<Set<string>>(
      new Set(),
    );

  const [seenIds, setSeenIds] =
    useState<string[]>([]);


  const refreshSaved =
    async () => {
      const saved =
        await CurioStorage.getSaved();

      setSavedIds(
        new Set(
          saved.map(
            item => item.id,
          ),
        ),
      );
    };


  const refreshSeen =
    async () => {
      setSeenIds(
        await CurioStorage.getSeenIds(),
      );
    };


  useEffect(() => {
    repository
      .getFeed()
      .then(setItems);

    refreshSaved();
    refreshSeen();
  }, []);


  const orderedInterests =
    useMemo(
      () =>
        interests
          .map(id =>
            INTERESTS.find(
              item =>
                item.id === id,
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


  /*
   * First four preferences.
   * If user skipped onboarding,
   * show first four available.
   */
  const categoryCards =
    useMemo(() => {
      if (
        orderedInterests.length
      ) {
        return orderedInterests.slice(
          0,
          4,
        );
      }

      return INTERESTS.slice(0, 4);
    }, [orderedInterests]);


  /*
   * Recommendation ordering:
   * preferred categories first.
   */
  const recommended =
    useMemo(() => {
      const preferred =
        new Set(interests);

      const matching =
        items.filter(item =>
          preferred.has(
            item.topicId,
          ),
        );

      const others =
        items.filter(
          item =>
            !preferred.has(
              item.topicId,
            ),
        );

      return [
        ...matching,
        ...others,
      ].slice(0, 5);
    }, [items, interests]);


  /*
   * Recently viewed curiosity.
   * CurioStorage already keeps
   * newest seen item first.
   */
  const continueExploring =
    useMemo(
      () =>
        seenIds
          .map(id =>
            items.find(
              item =>
                item.id === id,
            ),
          )
          .filter(
            (
              item,
            ): item is Curiosity =>
              Boolean(item),
          )
          .slice(0, 5),
      [seenIds, items],
    );


  const toggleSave =
    async (id: string) => {
      await CurioStorage
        .toggleSaved(id);

      refreshSaved();
    };


  const openCuriosity =
    (id: string) => {
      onOpenCuriosity(id);

      setTimeout(
        refreshSeen,
        100,
      );
    };


  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.page
        }>

        <View style={styles.header}>
          <CurioLogo />
        </View>


        <SectionHeader
          title="Categories"
          action="See all"
          onAction={
            onSeeAllCategories
          }
        />


        <View
          style={
            styles.categoryGrid
          }>

          {categoryCards.map(
            category => (
              <CategoryCard
                key={category.id}
                title={
                  category.label
                }
                imageUrl={
                  imageForCategory(
                    category.id,
                  )
                }
                onPress={() =>
                  onOpenCategory?.(
                    category.id,
                    category.label,
                  )
                }
              />
            ),
          )}

        </View>


        <View
          style={
            styles.sectionSpacing
          }>

          <SectionHeader
            title="Recommended for you"
          />

          <CuriosityRail
            items={recommended}
            savedIds={savedIds}
            onOpen={
              openCuriosity
            }
            onSave={toggleSave}
          />

        </View>


        {!!continueExploring.length && (
          <View
            style={
              styles.sectionSpacing
            }>

            <SectionHeader
              title="Continue exploring"
            />

            <CuriosityRail
              items={
                continueExploring
              }
              savedIds={
                savedIds
              }
              onOpen={
                openCuriosity
              }
              onSave={
                toggleSave
              }
            />

          </View>
        )}


        <View
          style={{
            height: 28,
          }}
        />

      </ScrollView>
    </SafeAreaView>
  );
};


const styles =
  StyleSheet.create({

    safe: {
      flex: 1,

      backgroundColor:
        curioTheme.colors.canvas,
    },

    page: {
      paddingTop: 18,
    },

    header: {
      paddingHorizontal: 20,

      paddingTop: 8,
      paddingBottom: 27,
    },

    sectionHeader: {
      paddingHorizontal: 20,

      marginBottom: 14,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    sectionTitle: {
      fontFamily: 'Roboto-Bold',

      fontSize: 20,

      letterSpacing: -0.3,

      color:
        curioTheme.colors.ink,
    },

    seeAll: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 2,
    },

    seeAllText: {
      fontFamily:
        'Roboto-Medium',

      fontSize: 14,

      color:
        curioTheme.colors.primary,
    },

    categoryGrid: {
      paddingHorizontal: 20,

      flexDirection: 'row',

      flexWrap: 'wrap',

      justifyContent:
        'space-between',

      rowGap: 13,
    },

    sectionSpacing: {
      marginTop: 34,
    },

    rail: {
      paddingLeft: 20,

      paddingRight: 8,

      paddingBottom: 8,
    },
  });
