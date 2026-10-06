import React, {useMemo, useState} from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {INTERESTS} from '../data/interests';
import {imageForCategory} from '../data/mock/categoryImages';
import {curioTheme} from '../theme';

interface Props {
  onComplete: (interests: string[]) => void;
}

export const InterestSelectionScreen = ({
  onComplete,
}: Props) => {
  const [selected, setSelected] = useState<string[]>([]);

  const selectedSet = useMemo(
    () => new Set(selected),
    [selected],
  );

  const toggle = (id: string) => {
    setSelected(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>

        <View style={styles.brandRow}>
          <Image
            source={require(
              '../../assets/brand/curio-mark.png'
            )}
            resizeMode="contain"
            style={styles.logo}
          />

          <Text style={styles.brand}>
            Curio
          </Text>
        </View>

        <Text style={styles.title}>
          What are you{'\n'}curious about?
        </Text>

        <Text style={styles.subtitle}>
          Pick anything that catches your eye.
          We'll mix it with plenty of surprises.
        </Text>

        <View style={styles.grid}>
          {INTERESTS.map(interest => {
            const isSelected =
              selectedSet.has(interest.id);

            return (
              <TouchableOpacity
                key={interest.id}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: isSelected,
                }}
                activeOpacity={0.88}
                onPress={() =>
                  toggle(interest.id)
                }
                style={[
                  styles.interest,
                  isSelected &&
                    styles.interestSelected,
                ]}>

                <ImageBackground
                  source={{
                    uri: imageForCategory(
                      interest.id,
                    ),
                  }}
                  resizeMode="cover"
                  style={styles.image}
                  imageStyle={
                    styles.imageRadius
                  }>

                  <View
                    style={
                      styles.imageOverlay
                    }
                  />

                  {isSelected && (
                    <View
                      style={styles.check}>
                      <Text
                        style={
                          styles.checkText
                        }>
                        ✓
                      </Text>
                    </View>
                  )}

                  <Text
                    numberOfLines={2}
                    style={
                      styles.interestLabel
                    }>
                    {interest.label}
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.88}
          onPress={() =>
            onComplete(selected)
          }
          style={styles.button}>

          <Text style={styles.buttonText}>
            {selected.length > 0
              ? `Continue · ${selected.length} selected`
              : 'Surprise me'}
          </Text>

          <Text style={styles.arrow}>
            →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 120,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 34,
  },

  logo: {
    width: 38,
    height: 38,
  },

  brand: {
    marginLeft: 8,

    fontFamily: 'Roboto-Black',
    fontSize: 27,
    letterSpacing: -0.8,

    color: curioTheme.colors.ink,
  },

  title: {
    fontFamily: 'Roboto-Black',

    fontSize: 40,
    lineHeight: 43,

    letterSpacing: -1.5,

    color: curioTheme.colors.ink,
  },

  subtitle: {
    marginTop: 12,
    marginBottom: 28,

    maxWidth: 350,

    fontFamily: 'Roboto-Regular',

    fontSize: 16,
    lineHeight: 23,

    color: curioTheme.colors.muted,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',
  },

  interest: {
    width: '48.5%',
    height: 132,

    marginBottom: 12,

    borderRadius: 20,

    borderWidth: 3,
    borderColor: 'transparent',

    overflow: 'hidden',

    backgroundColor:
      curioTheme.colors.surfaceMuted,
  },

  interestSelected: {
    borderColor:
      curioTheme.colors.primary,

    transform: [
      {
        scale: 0.975,
      },
    ],
  },

  image: {
    flex: 1,

    justifyContent: 'flex-end',

    padding: 13,
  },

  imageRadius: {
    borderRadius: 17,
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      'rgba(0,0,0,0.36)',
  },

  interestLabel: {
    fontFamily: 'Roboto-Bold',

    fontSize: 17,
    lineHeight: 20,

    color: '#FFFFFF',

    paddingRight: 12,
  },

  check: {
    position: 'absolute',

    top: 10,
    right: 10,

    width: 27,
    height: 27,

    borderRadius: 14,

    backgroundColor:
      curioTheme.colors.primary,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  checkText: {
    fontFamily: 'Roboto-Bold',

    fontSize: 15,

    color: '#FFFFFF',
  },

  footer: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,

    backgroundColor:
      'rgba(255,255,255,0.97)',
  },

  button: {
    height: 58,

    borderRadius: 18,

    paddingHorizontal: 21,

    backgroundColor:
      curioTheme.colors.primary,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  buttonText: {
    fontFamily: 'Roboto-Bold',

    fontSize: 17,

    color: '#FFFFFF',
  },

  arrow: {
    fontSize: 27,

    color: '#FFFFFF',
  },
});
