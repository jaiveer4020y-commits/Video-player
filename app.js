import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';
import Orientation from 'react-native-orientation-locker';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * (9 / 16);

// Your working API
const API_BASE_URL = 'https://u-1-1azw.onrender.com';

const VideoPlayerApp = () => {
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);

  const fetchStream = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter movie/series title');
      return;
    }

    setLoading(true);
    setError(null);
    setStreamData(null);
    
    try {
      const url = `${API_BASE_URL}/api/get-stream?title=${encodeURIComponent(title.trim())}`;
      
      console.log('🔍 Searching for:', title);
      console.log('📡 API URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();

      console.log('📦 Full API Response:', data);

      if (data.success) {
        setStreamData(data);
      } else {
        setError(data.error);
        Alert.alert('Error', data.error || 'Failed to get stream');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      Alert.alert('Network Error', 'Cannot connect to API server');
    } finally {
      setLoading(false);
    }
  };

  const onEnterFullscreen = () => {
    Orientation.lockToLandscape();
    setIsFullscreen(true);
  };

  const onExitFullscreen = () => {
    Orientation.lockToPortrait();
    setIsFullscreen(false);
  };

  const onError = (error) => {
    console.log('❌ Video Error:', error);
    Alert.alert('Playback Error', 'Failed to play video stream');
  };

  const clearAll = () => {
    setTitle('');
    setStreamData(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Video Player Section */}
        <View style={[styles.videoContainer, isFullscreen && styles.fullscreenVideo]}>
          {streamData ? (
            <VideoPlayer
              ref={videoRef}
              source={{ 
                uri: streamData.m3u8_url,
                headers: {
                  Referer: streamData.headers.Referer,
                  'User-Agent': streamData.headers['User-Agent']
                }
              }}
              style={styles.video}
              resizeMode="contain"
              onEnterFullscreen={onEnterFullscreen}
              onExitFullscreen={onExitFullscreen}
              onError={onError}
              toggleResizeModeOnFullscreen={false}
              controlTimeout={5000}
              showOnStart={false}
              seekColor="#FF0000" // Red seek bar
            />
          ) : (
            <View style={styles.placeholder}>
              {/* Loading Spinner with Netflix-style */}
              <View style={styles.loadingSpinnerContainer}>
                <Image 
                  source={{ uri: 'https://assets.nflxext.com/en_us/pages/wiplayer/site-spinner.png' }} 
                  style={styles.loadingSpinner}
                  resizeMode="contain"
                  onError={(error) => {
                    console.log('Loading image failed');
                  }}
                />
                <Text style={styles.loadingText}>
                  {loading ? 'Loading Stream...' : 'Ready to Play'}
                </Text>
              </View>
              
              {error && (
                <Text style={styles.errorText}>❌ {error}</Text>
              )}
            </View>
          )}
        </View>

        {/* Search Controls */}
        <View style={styles.controls}>
          <Text style={styles.label}>🎬 Video Player</Text>
          <Text style={styles.note}>
            Enter title in format: movie.name or series.s01e01{'\n'}
            Example: wednesday.s01e03, avengers.endgame
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter title (e.g., wednesday.s01e03)"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={fetchStream}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton, (!title.trim() || loading) && styles.buttonDisabled]} 
              onPress={fetchStream}
              disabled={!title.trim() || loading}
            >
              {loading ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.buttonText}>Loading...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>🎯 Play Stream</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.clearButton]} 
              onPress={clearAll}
              disabled={loading}
            >
              <Text style={styles.buttonText}>🗑️ Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Stream Information */}
          {streamData && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>📊 Stream Information</Text>
              <Text style={styles.infoText}>🎮 Video ID: {streamData.video_id}</Text>
              <Text style={styles.infoText}>🔗 M3U8 URL: Loaded with headers</Text>
              <Text style={styles.infoText}>📡 Referer: {streamData.headers.Referer}</Text>
              <Text style={styles.infoText}>✅ Status: Playing with extracted headers</Text>
            </View>
          )}

          {/* Quick Play Examples */}
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>🎯 Quick Play Examples:</Text>
            <View style={styles.exampleButtons}>
              {['wednesday.s01e03', 'avengers.endgame', 'oppenheimer.2023', 'series.s01e01'].map((example) => (
                <TouchableOpacity
                  key={example}
                  style={styles.exampleButton}
                  onPress={() => {
                    setTitle(example);
                    setTimeout(() => fetchStream(), 100);
                  }}
                >
                  <Text style={styles.exampleButtonText}>{example}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* API Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              🌐 API: {API_BASE_URL}
            </Text>
            <Text style={styles.statusText}>
              ⚡ Status: {loading ? 'Loading...' : streamData ? 'Playing' : 'Ready'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  videoContainer: {
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  fullscreenVideo: {
    height: Dimensions.get('window').height,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  loadingSpinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  controls: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  label: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  note: {
    color: '#888',
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF0000', // Red button
  },
  clearButton: {
    backgroundColor: '#6C757D',
  },
  buttonDisabled: {
    backgroundColor: '#495057',
    opacity: 0.6,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000', // Red accent
  },
  infoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 5,
  },
  examplesContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  examplesTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exampleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  exampleButtonText: {
    color: '#FF0000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    color: '#888',
    fontSize: 10,
    marginBottom: 2,
  },
});

export default VideoPlayerApp;  const fetchStream = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter movie/series title');
      return;
    }

    setLoading(true);
    setError(null);
    setStreamData(null);
    setIsLoading(true);
    
    try {
      const url = `${API_BASE_URL}/api/get-stream?title=${encodeURIComponent(title.trim())}`;
      
      console.log('🔍 Searching for:', title);
      console.log('📡 API URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();

      console.log('📦 Full API Response:', data);

      if (data.success) {
        setStreamData(data);
        setPlayerState(PLAYER_STATES.PLAYING);
        console.log('✅ Stream ready! Headers:', data.headers);
        console.log('🎯 M3U8 URL:', data.m3u8_url);
      } else {
        setError(data.error);
        Alert.alert('Error', data.error || 'Failed to get stream');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      Alert.alert('Network Error', 'Cannot connect to API server');
    } finally {
      setLoading(false);
    }
  };

  // Media controls functions
  const onSeek = (seek) => {
    videoRef.current.seek(seek);
  };

  const onPaused = (playerState) => {
    setPlayerState(playerState);
  };

  const onReplay = () => {
    setPlayerState(PLAYER_STATES.PLAYING);
    videoRef.current.seek(0);
  };

  const onProgress = (data) => {
    if (!isLoading && playerState !== PLAYER_STATES.ENDED) {
      setCurrentTime(data.currentTime);
    }
  };

  const onLoad = (data) => {
    console.log('✅ Video loaded successfully');
    setDuration(data.duration);
    setIsLoading(false);
  };

  const onLoadStart = () => {
    console.log('🔄 Video loading started');
    setIsLoading(true);
  };

  const onEnd = () => {
    console.log('🏁 Video ended');
    setPlayerState(PLAYER_STATES.ENDED);
  };

  const onSeeking = (currentTime) => setCurrentTime(currentTime);

  const onBuffer = ({ isBuffering }) => {
    console.log(isBuffering ? '🔄 Buffering...' : '✅ Buffering ended');
  };

  const onError = (error) => {
    console.log('❌ Video Error:', error);
    Alert.alert('Playback Error', 'Failed to play video stream. Check if headers are working.');
    setIsLoading(false);
  };

  const clearAll = () => {
    setTitle('');
    setStreamData(null);
    setError(null);
    setPlayerState(PLAYER_STATES.PAUSED);
    setCurrentTime(0);
  };

  // Auto-play example on app start (optional)
  useEffect(() => {
    // Uncomment to auto-play a title when app starts
    // setTitle('wednesday.s01e01');
    // fetchStream();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Video Player Section */}
        <View style={[styles.videoContainer, isFullscreen && styles.fullscreenVideo]}>
          {streamData ? (
            <View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                source={{ 
                  uri: streamData.m3u8_url,
                  headers: {
                    Referer: streamData.headers.Referer,
                    'User-Agent': streamData.headers['User-Agent']
                  }
                }}
                style={styles.video}
                resizeMode="contain"
                paused={playerState !== PLAYER_STATES.PLAYING}
                onLoad={onLoad}
                onLoadStart={onLoadStart}
                onProgress={onProgress}
                onEnd={onEnd}
                onBuffer={onBuffer}
                onError={onError}
                bufferConfig={{
                  minBufferMs: 15000,
                  maxBufferMs: 50000,
                  bufferForPlaybackMs: 2500,
                  bufferForPlaybackAfterRebufferMs: 5000
                }}
                minLoadRetryCount={3}
                maxBitRate={2000000}
              />
              
              <MediaControls
                ref={mediaControlsRef}
                mainColor="#FF0000" // Red player line
                playerState={playerState}
                isLoading={isLoading}
                progress={currentTime}
                duration={duration}
                onPaused={onPaused}
                onReplay={onReplay}
                onSeek={onSeek}
                onSeeking={onSeeking}
                onEnterFullscreen={() => setIsFullscreen(true)}
                onExitFullscreen={() => setIsFullscreen(false)}
              />
            </View>
          ) : (
            <View style={styles.placeholder}>
              {/* Loading Spinner with Netflix-style */}
              <View style={styles.loadingSpinnerContainer}>
                <Image 
                  source={{ uri: 'https://assets.nflxext.com/en_us/pages/wiplayer/site-spinner.png' }} 
                  style={styles.loadingSpinner}
                  resizeMode="contain"
                  onError={(error) => {
                    console.log('Loading image failed, using fallback');
                    // Fallback to local spinner or ActivityIndicator
                  }}
                />
                <Text style={styles.loadingText}>
                  {loading ? 'Loading Stream...' : 'Ready to Play'}
                </Text>
              </View>
              
              {error && (
                <Text style={styles.errorText}>❌ {error}</Text>
              )}
            </View>
          )}
        </View>

        {/* Search Controls */}
        <View style={styles.controls}>
          <Text style={styles.label}>🎬 Video Player</Text>
          <Text style={styles.note}>
            Enter title in format: movie.name or series.s01e01{'\n'}
            Example: wednesday.s01e03, avengers.endgame
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter title (e.g., wednesday.s01e03)"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={fetchStream}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton, (!title.trim() || loading) && styles.buttonDisabled]} 
              onPress={fetchStream}
              disabled={!title.trim() || loading}
            >
              {loading ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.buttonText}>Loading...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>🎯 Play Stream</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.clearButton]} 
              onPress={clearAll}
              disabled={loading}
            >
              <Text style={styles.buttonText}>🗑️ Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Stream Information */}
          {streamData && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>📊 Stream Information</Text>
              <Text style={styles.infoText}>🎮 Video ID: {streamData.video_id}</Text>
              <Text style={styles.infoText}>🔗 M3U8 URL: Loaded with headers</Text>
              <Text style={styles.infoText}>📡 Referer: {streamData.headers.Referer}</Text>
              <Text style={styles.infoText}>✅ Status: Playing with extracted headers</Text>
            </View>
          )}

          {/* Quick Play Examples */}
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>🎯 Quick Play Examples:</Text>
            <View style={styles.exampleButtons}>
              {['wednesday.s01e03', 'avengers.endgame', 'oppenheimer.2023', 'series.s01e01'].map((example) => (
                <TouchableOpacity
                  key={example}
                  style={styles.exampleButton}
                  onPress={() => {
                    setTitle(example);
                    setTimeout(() => fetchStream(), 100);
                  }}
                >
                  <Text style={styles.exampleButtonText}>{example}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* API Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              🌐 API: {API_BASE_URL}
            </Text>
            <Text style={styles.statusText}>
              ⚡ Status: {loading ? 'Loading...' : streamData ? 'Playing' : 'Ready'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  videoContainer: {
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  fullscreenVideo: {
    height: Dimensions.get('window').height,
  },
  videoWrapper: {
    flex: 1,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  loadingSpinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  controls: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  label: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  note: {
    color: '#888',
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF0000', // Red button
  },
  clearButton: {
    backgroundColor: '#6C757D',
  },
  buttonDisabled: {
    backgroundColor: '#495057',
    opacity: 0.6,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000', // Red accent
  },
  infoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 5,
  },
  examplesContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  examplesTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exampleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  exampleButtonText: {
    color: '#FF0000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    color: '#888',
    fontSize: 10,
    marginBottom: 2,
  },
});

export default VideoPlayerApp;
