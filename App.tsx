/**
 * WebView App with Camera & Microphone Permissions
 * React Native App for iOS and Android
 */

import React, {useState, useEffect} from 'react';
import {StatusBar, Platform, PermissionsAndroid, Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import HomeScreen from './src/components/HomeScreen';
import WebViewScreen from './src/components/WebViewScreen';

// Navigation types
type RootStackParamList = {
  Home: undefined;
  WebView: {url: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Request initial Android permissions on app start
const requestAndroidPermissions = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ];

    const results = await PermissionsAndroid.requestMultiple(permissions);

    const allGranted = Object.values(results).every(
      result => result === PermissionsAndroid.RESULTS.GRANTED,
    );

    if (!allGranted) {
      Alert.alert(
        'Permissions Notice',
        'Camera and microphone permissions are needed for full functionality. You can enable them in Settings.',
        [{text: 'OK'}],
      );
    }
  } catch (error) {
    console.error('Error requesting permissions:', error);
  }
};

function App(): React.JSX.Element {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    // Request permissions when app starts on Android
    requestAndroidPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f5f7fa"
        translucent={false}
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}>
          <Stack.Screen name="Home">
            {({navigation}) => (
              <HomeScreen
                onNavigateToWebView={(url: string) => {
                  setCurrentUrl(url);
                  navigation.navigate('WebView', {url});
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="WebView">
            {({navigation, route}) => (
              <WebViewScreen
                url={route.params?.url || currentUrl || ''}
                onGoBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
