import React, {useState} from 'react';
import {
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ContentItem} from '../types/content';
import {curioTheme} from '../theme';

interface Props {
  item: ContentItem;
  height: number;
}

const topicName = (topic: string) => topic.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

export const CurioCard = ({item, height}: Props) => {
  const [selectedChoice, setSelectedChoice] = useState<string>();
  const [revealed, setRevealed] = useState(false);
  const hasRemoteImage = item.visual?.type === 'image' && Boolean(item.visual.url);

  const share = () => Share.share({message: `${item.hook}${item.body ? `\n\n${item.body}` : ''}\n\nCurio`});

  return (
    <View style={[styles.page, {height}]}>
      <View style={[styles.card, {backgroundColor: item.accent || '#E8E1FF'}]}>
        <View style={styles.topRow}>
          <View style={styles.topicPill}>
            <Text style={styles.topicText}>{topicName(item.topic)}</Text>
          </View>
          <TouchableOpacity accessibilityLabel="Share this Curio" onPress={share} style={styles.iconButton}>
            <Ionicons name="paper-plane-outline" size={21} color={curioTheme.colors.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.main}>
          <Text style={styles.hook}>{item.hook}</Text>

          {hasRemoteImage ? (
            <Image source={{uri: item.visual?.url}} resizeMode="cover" style={styles.image} />
          ) : item.visual?.emoji ? (
            <View style={styles.visualBubble}>
              <Text style={styles.visualEmoji}>{item.visual.emoji}</Text>
            </View>
          ) : null}

          {item.format === 'choice' && item.choices ? (
            <View style={styles.choices}>
              {item.choices.map(choice => {
                const picked = selectedChoice === choice.id;
                return (
                  <TouchableOpacity
                    key={choice.id}
                    onPress={() => setSelectedChoice(choice.id)}
                    style={[styles.choice, picked && styles.choicePicked]}>
                    <Text style={[styles.choiceLabel, picked && styles.choiceLabelPicked]}>{choice.emoji}  {choice.label}</Text>
                    {selectedChoice && <Text style={styles.percentage}>{choice.percentage ?? 0}%</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : item.format === 'reveal' ? (
            <TouchableOpacity onPress={() => setRevealed(true)} style={styles.revealButton}>
              <Text style={styles.revealText}>{revealed ? item.revealText : 'Tap to open'}</Text>
            </TouchableOpacity>
          ) : item.body ? (
            <Text style={styles.body}>{item.body}</Text>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          {item.origin === 'trending' ? <Text style={styles.fresh}>●  FRESH</Text> : <View />}
          <Text style={styles.swipe}>SWIPE  ↑</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, backgroundColor: curioTheme.colors.white},
  card: {flex: 1, borderRadius: 34, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 22, overflow: 'hidden'},
  topRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  topicPill: {backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8},
  topicText: {fontFamily: 'Roboto-Bold', fontSize: 13, color: curioTheme.colors.ink},
  iconButton: {width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.72)', alignItems: 'center', justifyContent: 'center'},
  main: {flex: 1, justifyContent: 'center'},
  hook: {fontFamily: 'Roboto-Black', fontSize: 36, lineHeight: 40, letterSpacing: -1.2, color: curioTheme.colors.ink, textAlign: 'center'},
  body: {fontFamily: 'Roboto-Medium', fontSize: 20, lineHeight: 28, color: '#35313D', textAlign: 'center', marginTop: 24},
  image: {width: '100%', height: '43%', minHeight: 220, borderRadius: 28, marginTop: 28, backgroundColor: 'rgba(255,255,255,0.35)'},
  visualBubble: {alignSelf: 'center', marginVertical: 30, width: 190, height: 190, borderRadius: 95, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.55)'},
  visualEmoji: {fontSize: 100},
  choices: {marginTop: 26},
  choice: {minHeight: 55, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 17, marginBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  choicePicked: {backgroundColor: curioTheme.colors.ink},
  choiceLabel: {fontFamily: 'Roboto-Bold', fontSize: 16, color: curioTheme.colors.ink},
  choiceLabelPicked: {color: '#FFFFFF'},
  percentage: {fontFamily: 'Roboto-Black', fontSize: 15, color: '#6A6470'},
  revealButton: {minHeight: 85, borderRadius: 24, marginTop: 30, padding: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: curioTheme.colors.ink},
  revealText: {fontFamily: 'Roboto-Bold', fontSize: 18, lineHeight: 24, color: '#FFFFFF', textAlign: 'center'},
  bottomRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  fresh: {fontFamily: 'Roboto-Black', color: '#E44F69', fontSize: 11, letterSpacing: 1},
  swipe: {fontFamily: 'Roboto-Bold', color: 'rgba(23,21,30,0.48)', fontSize: 11, letterSpacing: 1.2},
});
