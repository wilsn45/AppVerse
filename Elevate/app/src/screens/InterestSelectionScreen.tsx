import React, {useMemo, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {INTERESTS} from '../data/interests';
import {curioTheme} from '../theme';

interface Props {
  onComplete: (interests: string[]) => void;
}

export const InterestSelectionScreen = ({onComplete}: Props) => {
  const [selected, setSelected] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (id: string) => {
    setSelected(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={curioTheme.colors.canvas} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>C</Text></View>
          <Text style={styles.brand}>Curio</Text>
        </View>
        <Text style={styles.title}>What are you into?</Text>
        <Text style={styles.subtitle}>Pick a few, or skip it. Curio will keep surprising you.</Text>

        <View style={styles.grid}>
          {INTERESTS.map(interest => {
            const isSelected = selectedSet.has(interest.id);
            return (
              <TouchableOpacity
                key={interest.id}
                accessibilityRole="checkbox"
                accessibilityState={{checked: isSelected}}
                activeOpacity={0.8}
                onPress={() => toggle(interest.id)}
                style={[
                  styles.interest,
                  {backgroundColor: interest.color},
                  isSelected && styles.interestSelected,
                ]}>
                <Text style={styles.emoji}>{interest.emoji}</Text>
                <Text style={styles.interestLabel}>{interest.label}</Text>
                {isSelected && <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onComplete(selected)}
          activeOpacity={0.85}
          style={styles.button}>
          <Text style={styles.buttonText}>{selected.length ? 'Start exploring' : 'Surprise me'}</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: curioTheme.colors.canvas},
  content: {paddingHorizontal: 20, paddingTop: 18, paddingBottom: 118},
  brandRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 34},
  brandMark: {width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: curioTheme.colors.purple, transform: [{rotate: '-7deg'}]},
  brandMarkText: {fontFamily: 'Roboto-Black', fontSize: 23, color: '#FFFFFF'},
  brand: {fontFamily: 'Roboto-Black', fontSize: 27, color: curioTheme.colors.ink, marginLeft: 10, letterSpacing: -0.8},
  title: {fontFamily: 'Roboto-Black', fontSize: 39, lineHeight: 44, letterSpacing: -1.4, color: curioTheme.colors.ink},
  subtitle: {fontFamily: 'Roboto-Regular', fontSize: 17, lineHeight: 24, color: curioTheme.colors.muted, marginTop: 10, marginBottom: 27, maxWidth: 340},
  grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  interest: {width: '48.5%', minHeight: 126, borderRadius: 24, padding: 16, marginBottom: 12, justifyContent: 'space-between', borderWidth: 3, borderColor: 'transparent'},
  interestSelected: {borderColor: curioTheme.colors.ink, transform: [{scale: 0.98}]},
  emoji: {fontSize: 35},
  interestLabel: {fontFamily: 'Roboto-Bold', fontSize: 17, lineHeight: 20, color: curioTheme.colors.ink, paddingRight: 12},
  check: {position: 'absolute', right: 12, top: 12, width: 25, height: 25, borderRadius: 13, backgroundColor: curioTheme.colors.ink, alignItems: 'center', justifyContent: 'center'},
  checkText: {fontFamily: 'Roboto-Bold', color: '#FFFFFF', fontSize: 15},
  footer: {position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24, backgroundColor: 'rgba(250,249,252,0.96)'},
  button: {height: 60, borderRadius: 22, paddingHorizontal: 23, backgroundColor: curioTheme.colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  buttonText: {fontFamily: 'Roboto-Bold', fontSize: 18, color: '#FFFFFF'},
  arrow: {fontSize: 28, color: '#FFFFFF'},
});
