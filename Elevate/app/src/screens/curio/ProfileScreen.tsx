import React from 'react';
import {
  Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {INTERESTS} from '../../data/interests';
import {curioTheme} from '../../theme';

type Props = {
  interests: string[];
  onChange: (interests: string[]) => void;
};

export const ProfileScreen = ({interests, onChange}: Props) => {
  const toggle = (id: string) => {
    const next = interests.includes(id)
      ? interests.filter(item => item !== id)
      : [...interests, id];

    onChange(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🤓</Text>
          </View>
          <Text style={styles.profileTitle}>Your Curio</Text>
          <Text style={styles.profileSubtitle}>Shape what you discover.</Text>
        </View>

        <Text style={styles.section}>Your interests</Text>
        <Text style={styles.hint}>
          Tap to add or remove. The number is the order used on your Home screen.
        </Text>

        <View style={styles.grid}>
          {INTERESTS.map(interest => {
            const index = interests.indexOf(interest.id);
            const selected = index >= 0;

            return (
              <Pressable
                key={interest.id}
                onPress={() => toggle(interest.id)}
                style={[styles.interest, selected && styles.selected]}>
                <Text style={styles.emoji}>{interest.emoji}</Text>
                <Text style={styles.label}>{interest.label}</Text>

                {selected && (
                  <View style={styles.order}>
                    <Text style={styles.orderText}>{index + 1}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#FFF'},
  content: {paddingHorizontal: 20, paddingTop: 14, paddingBottom: 35},
  heading: {fontFamily: 'Roboto-Black', fontSize: 30, color: curioTheme.colors.ink},
  profile: {alignItems: 'center', paddingVertical: 28},
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: curioTheme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarEmoji: {
    fontSize: 42,
  },
  profileTitle: {
    marginTop: 12, fontFamily: 'Roboto-Bold',
    fontSize: 20, color: curioTheme.colors.ink,
  },
  profileSubtitle: {
    marginTop: 4, fontFamily: 'Roboto-Regular',
    fontSize: 14, color: curioTheme.colors.muted,
  },
  section: {fontFamily: 'Roboto-Bold', fontSize: 20, color: curioTheme.colors.ink},
  hint: {
    marginTop: 5, marginBottom: 17,
    fontFamily: 'Roboto-Regular', fontSize: 13,
    lineHeight: 19, color: curioTheme.colors.muted,
  },
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 9},
  interest: {
    minHeight: 45, paddingHorizontal: 13,
    borderRadius: 16, borderWidth: 1,
    borderColor: curioTheme.colors.border,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF',
  },
  selected: {
    borderColor: curioTheme.colors.purple,
    backgroundColor: curioTheme.colors.primarySoft,
  },
  emoji: {fontSize: 17, marginRight: 7},
  label: {fontFamily: 'Roboto-Medium', fontSize: 13, color: curioTheme.colors.ink},
  order: {
    marginLeft: 8, width: 21, height: 21, borderRadius: 11,
    backgroundColor: curioTheme.colors.purple,
    alignItems: 'center', justifyContent: 'center',
  },
  orderText: {fontFamily: 'Roboto-Bold', fontSize: 11, color: '#FFF'},
});
