import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text
} from 'react-native';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  useProgress,
  Capability,
  State,
  usePlaybackState,
} from 'react-native-track-player';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '../../Theme/Theme';

interface AudioPlayerProps {
  audioUrl: string;
  thumbnailUrl: string;
  title: string;
  onNext: () => void;
  onPrev: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  thumbnailUrl,
  title,
  onNext,
  onPrev,
}) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const playbackState = usePlaybackState();
  const progress = useProgress();

  useEffect(() => {
  const setupAndPlay = async () => {
    console.log('Setting up TrackPlayer with URL:', audioUrl);
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: '',
      url: audioUrl,
      title: title,
      artist: 'Upward',
    });
    await TrackPlayer.play(); // <-- 🎯 Auto-plays here when component mounts
  };

  setupAndPlay();

  return () => {
    TrackPlayer.pause(); // <-- 🛑 Auto-pauses here when component unmounts
  };
}, [audioUrl]);

  useEffect(() => {
    const loadTrack = async () => {
        console.log('Loading track:', audioUrl);
      if (!audioUrl || !isPlayerReady) return;

      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: 'trackId',
        url: audioUrl,
        title: title,
        artist: 'Upward',
        artwork: thumbnailUrl,
      });
      await TrackPlayer.setRate(speed);
      await TrackPlayer.play();
    };

    loadTrack();
  }, [audioUrl, isPlayerReady]);

  const togglePlayback = async () => {
    if (playbackState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const changeSpeed = async () => {
  const speeds = [0.5, 1.0, 1.5, 2.0];
  const currentIndex = speeds.indexOf(speed);
  const nextSpeed = speeds[(currentIndex + 1) % speeds.length];

  setSpeed(nextSpeed);
  await TrackPlayer.setRate(nextSpeed);
};

  const seekTo = async (value: number) => {
    await TrackPlayer.seekTo(value);
  };

  return (
    <ImageBackground
      source={{ uri: thumbnailUrl }}
      style={styles.background}
      imageStyle={{ opacity: 0.3 }}
    >
      <View style={styles.container}>

        <Text style={styles.titleText}>{title}</Text>


        <Slider
          style={{ width: '80%', marginBottom: 20 }}
          minimumValue={0}
          maximumValue={progress.duration}
          value={progress.position}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#888"
          thumbTintColor="#fff"
        />

        <View style={styles.controls}>
          <TouchableOpacity onPress={onPrev} style={styles.iconButton}>
            <Ionicons name="play-skip-back" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayback} style={styles.iconButton}>
            <Ionicons
              name={playbackState === State.Playing ? 'pause' : 'play'}
              size={40}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onNext} style={styles.iconButton}>
            <Ionicons name="play-skip-forward" size={32} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={changeSpeed} style={styles.speedButton}>
          <Text style={styles.speedText}>{speed}x</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '70%',
    marginVertical: 20,
  },
  iconButton: {
    marginHorizontal: 20,
  },
  speedButton: {
    backgroundColor: theme.colors.white,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    opacity: 0.8,
  },
  speedText: {
    color: theme.colors.greyDark2,
    fontSize: 24,
  },
  titleText: {
    color: theme.colors.black,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default AudioPlayer;
