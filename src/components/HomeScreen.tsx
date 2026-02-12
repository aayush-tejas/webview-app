import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';

interface HomeScreenProps {
  onNavigateToWebView: (url: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({onNavigateToWebView}) => {
  const [url, setUrl] = useState('');

  // Validate URL format
  const isValidUrl = (urlString: string): boolean => {
    try {
      // Add https:// if no protocol specified
      let testUrl = urlString;
      if (!testUrl.match(/^https?:\/\//i)) {
        testUrl = `https://${urlString}`;
      }
      const urlObj = new URL(testUrl);
      return !!urlObj.hostname;
    } catch {
      return false;
    }
  };

  // Format URL with protocol
  const formatUrl = (urlString: string): string => {
    if (!urlString.match(/^https?:\/\//i)) {
      return `https://${urlString}`;
    }
    return urlString;
  };

  const handleOpenUrl = () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL');
      return;
    }

    const formattedUrl = formatUrl(trimmedUrl);
    onNavigateToWebView(formattedUrl);
  };

  // Sample URLs for quick testing
  const sampleUrls = [
    {label: 'Camera Test', url: 'https://webcamtests.com'},
    {label: 'Mic Test', url: 'https://www.onlinemictest.com'},
    {label: 'WebRTC Test', url: 'https://test.webrtc.org'},
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🌐 WebView App</Text>
          <Text style={styles.subtitle}>
            Enter a URL to open with camera & microphone access
          </Text>
        </View>

        {/* URL Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter URL (e.g., example.com)"
            placeholderTextColor="#999"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleOpenUrl}
          />
          <TouchableOpacity
            style={[styles.openButton, !url.trim() && styles.openButtonDisabled]}
            onPress={handleOpenUrl}
            disabled={!url.trim()}>
            <Text style={styles.openButtonText}>Open</Text>
          </TouchableOpacity>
        </View>

        {/* Permission Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Permissions Required</Text>
          <View style={styles.permissionList}>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>📷</Text>
              <Text style={styles.permissionText}>Camera Access</Text>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>🎤</Text>
              <Text style={styles.permissionText}>Microphone Access</Text>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permissionIcon}>🔊</Text>
              <Text style={styles.permissionText}>Audio Output</Text>
            </View>
          </View>
          <Text style={styles.infoNote}>
            Permissions will be requested when the webpage needs access.
          </Text>
        </View>

        {/* Quick Test URLs */}
        <View style={styles.sampleSection}>
          <Text style={styles.sampleTitle}>Quick Test URLs:</Text>
          <View style={styles.sampleButtons}>
            {sampleUrls.map((sample, index) => (
              <TouchableOpacity
                key={index}
                style={styles.sampleButton}
                onPress={() => setUrl(sample.url)}>
                <Text style={styles.sampleButtonText}>{sample.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Built with React Native + WebView
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e1e4e8',
    color: '#333',
  },
  openButton: {
    height: 54,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  permissionList: {
    gap: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionIcon: {
    fontSize: 24,
  },
  permissionText: {
    fontSize: 16,
    color: '#444',
  },
  infoNote: {
    marginTop: 16,
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  sampleSection: {
    marginTop: 8,
  },
  sampleTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  sampleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sampleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#e8f4fd',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#b3d9f7',
  },
  sampleButtonText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default HomeScreen;
