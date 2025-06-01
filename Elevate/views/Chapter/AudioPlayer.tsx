import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import theme from '../../Theme/Theme';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { OngoingCourseDBHandler } from '../../DBHandler/OngoingCourseDBHandler.tsx';

const { height } = Dimensions.get('window');

interface Chapter {
  id: string;
  title: string;
  // Add other fields as needed
}

interface AudioPlayerProps {
  chapterList: Chapter[];
  currentIndex: number;
  courseId: string;
  thumbnailUrl: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ chapterList, currentIndex, courseId, thumbnailUrl }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const positionInterval = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentChapter = chapterList[activeIndex];

  // Fetch audio URL from Firestore
  const fetchAudioUrl = async () => {
    setIsLoading(true);
    try {
      const doc = await firestore().collection('chapters').doc(currentChapter.id).get();
      const audioUrl = doc.data()?.audioUrl;

      if (!audioUrl) {
        throw new Error('Audio URL not found');
      }

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, rate: speed }
      );

      setSound(newSound);
      setDuration(status.durationMillis || 0);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.positionMillis !== undefined) {
          setPosition(status.positionMillis);
        }
      });
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load audio when chapter changes
  useEffect(() => {
    fetchAudioUrl();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [activeIndex]);

  // Toggle speed
  const toggleSpeed = () => {
    const newSpeed = speed === 1.0 ? 1.5 : speed === 1.5 ? 2.0 : 1.0;
    setSpeed(newSpeed);
    if (sound) {
      sound.setRateAsync(newSpeed, true);
    }
  };

  const seek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  const goToNext = () => {
    if (activeIndex < chapterList.length - 1) {
      setActiveIndex((prev) => prev + 1);
       OngoingCourseDBHandler.saveChapter(courseId,currentChapter.id)
    }
  };

  const goToPrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  return (
    <ImageBackground
      source={{ uri: thumbnailUrl }}
      style={styles.background}
      imageStyle={{ opacity: 0.3 }}
    >
      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#555" />
        ) : (
          <>
            <Text style={styles.title}>{currentChapter.title}</Text>

            <Slider
              style={{ width: '90%', height: 40 }}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={seek}
              minimumTrackTintColor="#1FB28A"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#1FB28A"
            />

            <View style={styles.controls}>
              <TouchableOpacity onPress={goToPrev} style={styles.button}>
                <Ionicons name="chevron-back-outline" size={28} color={theme.colors.greyDark} />
              </TouchableOpacity>

              <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
                <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={64}
                    color={theme.colors.black}
                    />
              </TouchableOpacity>

              <TouchableOpacity onPress={goToNext} style={styles.button}>
                <Ionicons name="chevron-forward-outline" size={28} color={theme.colors.greyDark} />
              </TouchableOpacity>
            </View>

             <TouchableOpacity onPress={toggleSpeed} style={styles.speedButton}>
              <Text style={styles.speedText}>{speed}x</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: -height * 0.1,
  },
  title: {
    fontSize: 20,
    color: theme.colors.black,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  button: {
    padding: 10,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 22,
    color: '#fff',
  },
  speedButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  speedText: {
    fontSize: 16,
    fontWeight:'bold',
    color: theme.colors.black,
  },
});

export default AudioPlayer;
