import React from 'react';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import {Curiosity} from '../../models/Curiosity';
import {curioTheme} from '../../theme';

type Props = {
  curiosity: Curiosity;
  onPress: () => void;
  onSave?: () => void;
  saved?: boolean;
  fullWidth?: boolean;
};

export const CuriosityCard = ({
  curiosity,
  onPress,
  onSave,
  saved,
  fullWidth = false,
}: Props) => {
  if (fullWidth) {
    return (
      <Pressable
        onPress={onPress}
        style={({pressed}) => [
          styles.fullCard,
          pressed && styles.pressed,
        ]}>

        <Image
          source={{uri: curiosity.imageUrl}}
          style={styles.fullImage}
        />

        <View style={styles.fullBody}>
          <View style={styles.top}>
            <TopicPill topic={curiosity.topic} />

            {onSave && (
              <SaveButton
                saved={saved}
                onSave={onSave}
              />
            )}
          </View>

          <Text
            numberOfLines={2}
            style={styles.fullHook}>
            {curiosity.hook}
          </Text>

          <Text
            numberOfLines={2}
            style={styles.teaser}>
            {curiosity.teaser}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        pressed && styles.pressed,
      ]}>

      <View style={styles.content}>
        <View style={styles.top}>
          <TopicPill topic={curiosity.topic} />

          {onSave && (
            <SaveButton
              saved={saved}
              onSave={onSave}
            />
          )}
        </View>

        <Text
          numberOfLines={2}
          style={styles.hook}>
          {curiosity.hook}
        </Text>


      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{uri: curiosity.imageUrl}}
          style={styles.image}
        />
      </View>
    </Pressable>
  );
};

const TopicPill = ({
  topic,
}: {
  topic: string;
}) => (
  <View style={styles.topicPill}>
    <Text
      numberOfLines={1}
      style={styles.topic}>
      {topic}
    </Text>
  </View>
);

const SaveButton = ({
  saved,
  onSave,
}: {
  saved?: boolean;
  onSave: () => void;
}) => (
  <Pressable
    hitSlop={12}
    onPress={event => {
      event.stopPropagation();
      onSave();
    }}
    style={styles.saveButton}>

    <Icon
      name={
        saved
          ? 'bookmark'
          : 'bookmark-outline'
      }
      size={16}
      color={
        saved
          ? curioTheme.colors.primary
          : curioTheme.colors.muted
      }
    />
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    width: 340,
    height: 128,

    flexDirection: 'row',

    marginRight: 12,

    borderRadius: 19,

    backgroundColor:
      curioTheme.colors.surface,

    borderWidth: 1,
    borderColor:
      curioTheme.colors.border,

    overflow: 'hidden',

    elevation: 1,

    shadowColor: '#000000',
    shadowOpacity: 0.035,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  pressed: {
    opacity: 0.82,
    transform: [{scale: 0.985}],
  },

  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  imageContainer: {
    width: 112,

    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 6,

    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: 92,
    height: 92,

    borderRadius: 16,

    backgroundColor:
      curioTheme.colors.surfaceMuted,
  },

  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 7,
  },

  topicPill: {
    maxWidth: 112,

    paddingHorizontal: 8,
    paddingVertical: 4,

    borderRadius: 8,

    backgroundColor:
      curioTheme.colors.primarySoft,
  },

  topic: {
    fontFamily: 'Roboto-Bold',

    fontSize: 9,

    letterSpacing: 0.35,

    textTransform: 'uppercase',

    color: curioTheme.colors.primary,
  },

  hook: {
    fontFamily: 'Roboto-Bold',

    fontSize: 16,
    lineHeight: 20,

    color: curioTheme.colors.ink,
  },

  explore: {
    marginTop: 'auto',

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  exploreText: {
    fontFamily: 'Roboto-Bold',

    fontSize: 11,

    color: curioTheme.colors.primary,
  },

  saveButton: {
    width: 27,
    height: 27,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      curioTheme.colors.surfaceMuted,
  },

  fullCard: {
    width: '100%',

    marginBottom: 16,

    borderRadius: 21,

    backgroundColor:
      curioTheme.colors.surface,

    borderWidth: 1,
    borderColor:
      curioTheme.colors.border,

    overflow: 'hidden',
  },

  fullImage: {
    width: '100%',
    height: 165,

    backgroundColor:
      curioTheme.colors.surfaceMuted,
  },

  fullBody: {
    padding: 16,
  },

  fullHook: {
    fontFamily: 'Roboto-Black',

    fontSize: 20,
    lineHeight: 25,

    letterSpacing: -0.35,

    color: curioTheme.colors.ink,
  },

  teaser: {
    marginTop: 7,

    fontFamily: 'Roboto-Regular',

    fontSize: 13,
    lineHeight: 19,

    color: curioTheme.colors.muted,
  },
});
