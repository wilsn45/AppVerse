import React, {
  useEffect,
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

import {CategoryCard} from '../../components/curio/CategoryCard';
import {CuriosityCard} from '../../components/curio/CuriosityCard';
import {INTERESTS} from '../../data/interests';
import {Curiosity} from '../../models/Curiosity';
import {MockCuriosityRepository} from '../../repositories/MockCuriosityRepository';
import {CurioStorage} from '../../services/CurioStorage';
import {curioTheme} from '../../theme';

const repository = new MockCuriosityRepository();

type Props = {
  interests: string[];
  categoryId: string;
  categoryName: string;
  onBack: () => void;
  onOpenCuriosity: (id: string) => void;
};

const imageForCategory = (
  topicId: string,
) => {
  const images: Record<string, string> = {
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

  return images[topicId] ??
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
};

export const CategoryScreen = ({
  interests,
  categoryId,
  categoryName,
  onBack,
  onOpenCuriosity,
}: Props) => {
  const [items, setItems] =
    useState<Curiosity[]>([]);

  const [savedIds, setSavedIds] =
    useState<Set<string>>(new Set());

  const refreshSaved = async () => {
    const saved = await CurioStorage.getSaved();
    setSavedIds(
      new Set(saved.map(item => item.id)),
    );
  };

  useEffect(() => {
    if (categoryId !== '__all__') {
      repository
        .getByTopic(categoryId)
        .then(setItems);
    }

    refreshSaved();
  }, [categoryId]);

  const toggleSave = async (id: string) => {
    await CurioStorage.toggleSaved(id);
    refreshSaved();
  };

  const preferredCategories = interests
    .map(id =>
      INTERESTS.find(
        interest => interest.id === id,
      ),
    )
    .filter(
      (
        interest,
      ): interest is NonNullable<
        typeof interest
      > => Boolean(interest),
    );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Pressable
          onPress={onBack}
          hitSlop={14}
          style={styles.back}>
          <Icon
            name="chevron-back"
            size={27}
            color={curioTheme.colors.primary}
          />
        </Pressable>

        <Text style={styles.navTitle}>
          {categoryName}
        </Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {categoryId === '__all__' ? (
          <>
            <Text style={styles.heading}>
              Your categories
            </Text>

            <Text style={styles.subtitle}>
              Explore the topics you picked.
            </Text>

            <View style={styles.categoryGrid}>
              {preferredCategories.map(
                category => (
                  <CategoryCard
                    key={category.id}
                    title={category.label}
                    imageUrl={imageForCategory(
                      category.id,
                    )}
                    onPress={() => {}}
                  />
                ),
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.heading}>
              Explore {categoryName}
            </Text>

            <Text style={styles.subtitle}>
              Questions worth following.
            </Text>

            <View style={styles.cards}>
              {items.map(item => (
                <CuriosityCard
                  key={item.id}
                  curiosity={item}
                  fullWidth
                  saved={savedIds.has(
                    item.id,
                  )}
                  onPress={() =>
                    onOpenCuriosity(
                      item.id,
                    )
                  }
                  onSave={() =>
                    toggleSave(item.id)
                  }
                />
              ))}
            </View>
          </>
        )}
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
    marginTop: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: curioTheme.colors.ink,
  },

  placeholder: {
    width: 42,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  heading: {
    fontFamily: 'Roboto-Black',
    fontSize: 31,
    letterSpacing: -0.8,
    color: curioTheme.colors.ink,
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 24,
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
    color: curioTheme.colors.muted,
  },

  cards: {
    width: '100%',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
});
