import React, {useRef, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';
import {useFocusEffect} from '@react-navigation/native';

interface WebViewScreenProps {
  url: string;
  onGoBack: () => void;
}

const WebViewScreen: React.FC<WebViewScreenProps> = ({url, onGoBack}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState<{
    camera: boolean;
    microphone: boolean;
  }>({camera: false, microphone: false});

  // Handle Android hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        onGoBack();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [canGoBack, onGoBack]),
  );

  // Request permissions based on platform
  const requestPermission = async (
    permissionType: 'camera' | 'microphone',
  ): Promise<boolean> => {
    let permission: Permission;

    if (Platform.OS === 'ios') {
      permission =
        permissionType === 'camera'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.IOS.MICROPHONE;
    } else {
      permission =
        permissionType === 'camera'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.ANDROID.RECORD_AUDIO;
    }

    try {
      const result = await request(permission);
      const granted = result === RESULTS.GRANTED;

      setPermissionsGranted(prev => ({
        ...prev,
        [permissionType]: granted,
      }));

      return granted;
    } catch (error) {
      console.error(`Error requesting ${permissionType} permission:`, error);
      return false;
    }
  };

  // Request all required permissions
  const requestAllPermissions = async () => {
    const cameraGranted = await requestPermission('camera');
    const microphoneGranted = await requestPermission('microphone');

    if (!cameraGranted || !microphoneGranted) {
      Alert.alert(
        'Permissions Required',
        'Camera and microphone permissions are required for this feature. Please enable them in your device settings.',
        [{text: 'OK'}],
      );
    }

    return cameraGranted && microphoneGranted;
  };

  // Handle permission requests from WebView
  const handlePermissionRequest = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'PERMISSION_REQUEST') {
        if (data.permission === 'camera') {
          await requestPermission('camera');
        } else if (data.permission === 'microphone') {
          await requestPermission('microphone');
        } else if (data.permission === 'all') {
          await requestAllPermissions();
        }
      }
    } catch (error) {
      // Not a JSON message or not a permission request
    }
  };

  // JavaScript to inject into WebView for handling media access
  const injectedJavaScript = `
    (function() {
      // Override getUserMedia to send permission requests to React Native
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      
      navigator.mediaDevices.getUserMedia = async function(constraints) {
        // Notify React Native about permission request
        if (constraints.video) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PERMISSION_REQUEST',
            permission: 'camera'
          }));
        }
        if (constraints.audio) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PERMISSION_REQUEST',
            permission: 'microphone'
          }));
        }
        
        return originalGetUserMedia(constraints);
      };

      // Handle permissions query
      const originalQuery = navigator.permissions.query.bind(navigator.permissions);
      navigator.permissions.query = async function(permissionDesc) {
        return originalQuery(permissionDesc);
      };

      true;
    })();
  `;

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.permissionStatus}>
          <Text
            style={[
              styles.permissionIndicator,
              permissionsGranted.camera && styles.permissionGranted,
            ]}>
            📷
          </Text>
          <Text
            style={[
              styles.permissionIndicator,
              permissionsGranted.microphone && styles.permissionGranted,
            ]}>
            🎤
          </Text>
        </View>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{uri: url}}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={navState => setCanGoBack(navState.canGoBack)}
        onMessage={handlePermissionRequest}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        // Android specific props
        mediaCapturePermissionGrantType="grant"
        // iOS specific props
        allowsAirPlayForMediaPlayback={true}
        // Security
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        // Error handling
        onError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent.statusCode);
        }}
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  permissionStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  permissionIndicator: {
    fontSize: 20,
    opacity: 0.4,
  },
  permissionGranted: {
    opacity: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default WebViewScreen;
