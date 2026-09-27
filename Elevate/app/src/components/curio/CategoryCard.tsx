import React from 'react';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {curioTheme} from '../../theme';

type Props = {
  title: string;
  imageUrl: string;
  onPress: () => void;
};

export const CategoryCard = ({
  title,
  imageUrl,
  onPress,
}: Props) => (
  <Pressable
    onPress={onPress}
    style={({pressed}) => [
      styles.card,
      pressed && styles.pressed,
    ]}>

    <Image
      source={{uri: imageUrl}}
      style={styles.image}
    />

    <View style={styles.labelArea}>
      <Text
        numberOfLines={1}
        style={styles.title}>
        {title}
      </Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    overflow: 'hidden',

    borderRadius:
      curioTheme.radius.medium,

    backgroundColor:
      curioTheme.colors.surface,

    borderWidth: 1,
    borderColor:
      curioTheme.colors.border,

    shadowColor:
      curioTheme.colors.shadow,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.22,
    shadowRadius: 5,

    elevation: 3,
  },

  pressed: {
    opacity: 0.82,
    transform: [{scale: 0.985}],
  },

  image: {
    width: '100%',
    height: 112,

    backgroundColor:
      curioTheme.colors.surfaceMuted,
  },

  labelArea: {
    minHeight: 48,

    paddingHorizontal: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontFamily: 'Roboto-Medium',

    fontSize: 15,

    textAlign: 'center',

    color:
      curioTheme.colors.text,
  },
});
