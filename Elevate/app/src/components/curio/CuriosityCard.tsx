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
  saved = false,
  fullWidth = false,
}: Props) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [
      styles.card,
      fullWidth && styles.fullWidth,
      pressed && styles.pressed,
    ]}>

    <View style={styles.topRow}>

      {/* LEFT: TITLE */}
      <View style={styles.textArea}>
        <Text
          numberOfLines={3}
          style={styles.title}>
          {curiosity.hook}
        </Text>
      </View>


      {/* RIGHT: IMAGE */}
      {!!curiosity.visual.url && (
        <Image
          source={{
            uri: curiosity.visual.url,
          }}
          style={styles.image}
        />
      )}

    </View>


    <View style={styles.bottomRow}>

      {/* CATEGORY */}
      <View style={styles.categoryPill}>
        <Text
          numberOfLines={1}
          style={styles.category}>
          {curiosity.topic}
        </Text>
      </View>


      {/* SAVE */}
      {!!onSave && (
        <Pressable
          hitSlop={10}
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
            size={21}
            color={
              curioTheme.colors.primary
            }
          />

        </Pressable>
      )}

    </View>

  </Pressable>
);


const styles = StyleSheet.create({

  card: {
    width: 340,

    minHeight: 160,

    marginRight: 12,

    padding: 14,

    borderRadius: 16,

    backgroundColor:
      curioTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      curioTheme.colors.border,

    shadowColor:
      curioTheme.colors.shadow,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.13,
    shadowRadius: 5,

    elevation: 2,
  },

  fullWidth: {
    width: '100%',
    marginRight: 0,
  },

  pressed: {
    opacity: 0.82,
  },


  // ========================================================
  // TOP
  // ========================================================

  topRow: {
    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent:
      'space-between',
  },

  textArea: {
    flex: 1,

    paddingRight: 14,
  },

  title: {
    fontFamily:
      'Roboto-Bold',

    fontSize: 19,
    lineHeight: 24,

    letterSpacing: -0.3,

    color:
      curioTheme.colors.ink,
  },

  image: {
    width: 102,
    height: 82,

    borderRadius: 12,

    resizeMode: 'cover',

    backgroundColor:
      curioTheme.colors
        .surfaceMuted,
  },


  // ========================================================
  // BOTTOM
  // ========================================================

  bottomRow: {
    marginTop: 13,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',
  },

  categoryPill: {
    alignSelf: 'flex-start',

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 9,

    // fill only — no outline
    backgroundColor:
      curioTheme.colors.brandSoft,
  },

  category: {
    fontFamily:
      'Roboto-Medium',

    fontSize: 11,

    color:
      curioTheme.colors.brand,
  },


  // ========================================================
  // SAVE — NO BACKGROUND
  // ========================================================

  saveButton: {
    width: 34,
    height: 34,

    alignItems: 'center',
    justifyContent: 'center',
  },
});
