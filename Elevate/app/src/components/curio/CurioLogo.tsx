import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {curioTheme} from '../../theme';

type Props = {compact?: boolean};

export const CurioLogo = ({compact = false}: Props) => (
  <View style={styles.row}>
    <View style={[styles.mark, compact && styles.markCompact]}>
      <Text style={[styles.c, compact && styles.cCompact]}>C</Text>
    </View>
    {!compact && <Text style={styles.name}>urio</Text>}
  </View>
);

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  mark: {
    width: 38, height: 38, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: curioTheme.colors.brand,
    transform: [{rotate: '-7deg'}],
  },
  markCompact: {width: 32, height: 32, borderRadius: 11},
  c: {fontFamily: 'Roboto-Black', fontSize: 23, color: '#FFF'},
  cCompact: {fontSize: 19},
  name: {
    marginLeft: 2, fontFamily: 'Roboto-Black',
    fontSize: 27, letterSpacing: -0.8,
    color: curioTheme.colors.ink,
  },
});
