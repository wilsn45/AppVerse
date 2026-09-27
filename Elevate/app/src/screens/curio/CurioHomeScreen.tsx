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
import {CuriosityCard} from '../../components/curio/CuriosityCard';
import {Curiosity} from '../../models/Curiosity';
import {MockCuriosityRepository} from '../../repositories/MockCuriosityRepository';
import {CurioStorage} from '../../services/CurioStorage';
import {INTERESTS} from '../../data/interests';
import {curioTheme} from '../../theme';

type Props = {
  interests: string[];
  onOpenCuriosity: (id: string) => void;
  onOpenCategory: (
    categoryId: string,
    categoryName: string,
  ) => void;
};

const repository = new MockCuriosityRepository();

export const CurioHomeScreen = ({
  interests,
  onOpenCuriosity,
  onOpenCategory,
}: Props) => {
  const [items, setItems] = useState<Curiosity[]>([]);
  const [savedIds, setSavedIds] =
    useState<Set<string>>(new Set());

  const refreshSaved = async () => {
    const saved = await CurioStorage.getSaved();
    setSavedIds(new Set(saved.map(item => item.id)));
  };

  useEffect(() => {
    repository.getFeed().then(setItems);
    refreshSaved();
  }, []);

  const orderedInterests = useMemo(
    () =>
      interests
        .map(id =>
          INTERESTS.find(item => item.id === id),
        )
        .filter(
          (
            item,
          ): item is NonNullable<typeof item> =>
            Boolean(item),
        ),
    [interests],
  );

  const recommended = useMemo(() => {
    const preferred = new Set(interests);

    const matching = items.filter(item =>
      preferred.has(item.topicId),
    );

    const rest = items.filter(
      item => !preferred.has(item.topicId),
    );

    return [...matching, ...rest].slice(0, 5);
  }, [items, interests]);

  const toggleSave = async (id: string) => {
    await CurioStorage.toggleSaved(id);
    refreshSaved();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}>

        <View style={styles.header}>
          <CurioLogo />
        </View>

        <Section
          title="Recommended"
          items={recommended}
          savedIds={savedIds}
          onOpen={onOpenCuriosity}
          onSave={toggleSave}
        />

        {orderedInterests.map(interest => {
          const categoryItems = items
            .filter(
              item =>
                item.topicId === interest.id,
            )
            .slice(0, 5);

          if (!categoryItems.length) {
            return null;
          }

          return (
            <Section
              key={interest.id}
              title={interest.label}
              items={categoryItems}
              savedIds={savedIds}
              onOpen={onOpenCuriosity}
              onSave={toggleSave}
              onSeeAll={() =>
                onOpenCategory(
                  interest.id,
                  interest.label,
                )
              }
            />
          );
        })}

        <View style={{height: 18}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({
  title,
  items,
  savedIds,
  onOpen,
  onSave,
  onSeeAll,
}: {
  title: string;
  items: Curiosity[];
  savedIds: Set<string>;
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
  onSeeAll?: () => void;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {onSeeAll && (
        <Pressable
          onPress={onSeeAll}
          style={styles.seeAll}>
          <Text style={styles.seeAllText}>
            See all
          </Text>

          <Icon
            name="chevron-forward"
            size={16}
            color={curioTheme.colors.purple}
          />
        </Pressable>
      )}
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}>
      {items.map(item => (
        <CuriosityCard
          key={item.id}
          curiosity={item}
          saved={savedIds.has(item.id)}
          onSave={() => onSave(item.id)}
          onPress={() => onOpen(item.id)}
        />
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: curioTheme.colors.canvas,
  },

  page: {
    paddingTop: 40,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },

  section: {
    marginBottom: 23,
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontFamily: 'Roboto-Black',
    fontSize: 22,
    letterSpacing: -0.5,
    color: curioTheme.colors.ink,
  },

  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  seeAllText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 13,
    color: curioTheme.colors.purple,
  },

  rail: {
    paddingLeft: 20,
    paddingRight: 6,
  },
});
