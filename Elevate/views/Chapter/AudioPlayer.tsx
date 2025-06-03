import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text,
  Dimensions
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
    setPaused(true);
    onNext();
  };

  const handleOnPrev = () => {
    setPaused(true);
    onPrev();
  };

  const handleLoad = ({ duration }: { duration: number }) => {
    setDuration(duration);
    setPaused(false);
    console.log('thumbnailUrl', thumbnailUrl);
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
        <View style={styles.controllerView}>
          <Text style={styles.titleText}>{title}</Text>

          <View style={styles.sliderContainer}>
            <Slider
              style={{ width: '100%' }}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onSlidingComplete={seekTo}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#888"
              thumbTintColor="#fff"
            />
          </View>

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
          <View style={styles.speedControllerView}>
              <TouchableOpacity onPress={changeSpeed} style={styles.speedButton}>
                  <Text style={styles.speedText}>{speed}x</Text>
              </TouchableOpacity>
          </View>

         

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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controllerView: {
    backgroundColor: theme.colors.whiteTransparent1,
    padding: 40,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  speedControllerView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  iconButton: {
    marginHorizontal: 20,
  },
  speedButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    color: theme.colors.greyDark2,
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    textAlign: 'center',
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
