import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text
} from 'react-native';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
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
  const playerRef = useRef<Video>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlayback = () => {
    setPaused(prev => !prev);
  };

  const changeSpeed = () => {
    const speeds = [0.5, 1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
  };

  const handleOnNext = () => {
    setPaused(true); // Pause before moving to next
    onNext();
  }

  const handleOnPrev = () => {
    setPaused(true); // Pause before moving to previous
    onPrev();
  };

  const handleLoad = ({ duration }: { duration: number }) => {
  setDuration(duration);
  setPaused(false);
  // You can call any other function or add additional logic here
};

  const seekTo = (value: number) => {
    playerRef.current?.seek(value);
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
          maximumValue={duration}
          value={currentTime}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="#888"
          thumbTintColor="#fff"
        />

        <View style={styles.controls}>
          <TouchableOpacity onPress={handleOnPrev} style={styles.iconButton}>
            <Ionicons name="play-skip-back" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayback} style={styles.iconButton}>
            <Ionicons
              name={paused ? 'play' : 'pause'}
              size={40}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleOnNext} style={styles.iconButton}>
            <Ionicons name="play-skip-forward" size={32} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={changeSpeed} style={styles.speedButton}>
          <Text style={styles.speedText}>{speed}x</Text>
        </TouchableOpacity>

        {/* Hidden Video player for audio-only */}
        <Video
          ref={playerRef}
          source={{ uri: audioUrl }}
          paused={paused}
          rate={speed}
          audioOnly
          playInBackground
          ignoreSilentSwitch="ignore"
          onProgress={({ currentTime }) => setCurrentTime(currentTime)}
           onLoad={handleLoad}
          onEnd={onNext}
          onError={(e) => console.log('Video error', e)}
          style={{ width: 0, height: 0 }} // hidden
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 8
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
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
  },
  titleText: {
    color: theme.colors.black,
    fontFamily: 'Roboto-Medium',
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 18,
    textAlign: 'center',
    maxWidth: '70%',
  },
});

export default AudioPlayer;
