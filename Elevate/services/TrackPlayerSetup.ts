import TrackPlayer from 'react-native-track-player';

export async function setupPlayer() {
  await TrackPlayer.setupPlayer();

  await TrackPlayer.updateOptions({
    
    stopWithApp: false,
    capabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
      TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
      TrackPlayer.CAPABILITY_SEEK_TO,
    ],
    compactCapabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
    ],
    alwaysPauseOnInterruption: true,
  });
}