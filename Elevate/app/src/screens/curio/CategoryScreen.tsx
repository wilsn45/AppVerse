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

import {CuriosityCard} from '../../components/curio/CuriosityCard';
import {Curiosity} from '../../models/Curiosity';
import {MockCuriosityRepository} from '../../repositories/MockCuriosityRepository';
import {CurioStorage} from '../../services/CurioStorage';
import {curioTheme} from '../../theme';

const repository = new MockCuriosityRepository();

type Props = {
  categoryId: string;
  categoryName: string;
  onBack: () => void;
  onOpenCuriosity: (id: string) => void;
};

export const CategoryScreen = ({
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
    repository
      .getByTopic(categoryId)
      .then(setItems);

    refreshSaved();
  }, [categoryId]);

  const toggleSave = async (id: string) => {
    await CurioStorage.toggleSaved(id);
    refreshSaved();
  };

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
            color={curioTheme.colors.purple}
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
              saved={savedIds.has(item.id)}
              onPress={() =>
                onOpenCuriosity(item.id)
              }
              onSave={() =>
                toggleSave(item.id)
              }
            />
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
      curioTheme.colors.purpleSoft,
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
});
