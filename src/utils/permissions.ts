import {Platform, Alert} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
  PermissionStatus,
  openSettings,
} from 'react-native-permissions';

export type PermissionType = 'camera' | 'microphone';

interface PermissionResult {
  granted: boolean;
  status: PermissionStatus;
}

// Get platform-specific permission constant
const getPermissionConstant = (type: PermissionType): Permission => {
  if (Platform.OS === 'ios') {
    return type === 'camera'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.IOS.MICROPHONE;
  } else {
    return type === 'camera'
      ? PERMISSIONS.ANDROID.CAMERA
      : PERMISSIONS.ANDROID.RECORD_AUDIO;
  }
};

// Check a single permission
export const checkPermission = async (
  type: PermissionType,
): Promise<PermissionResult> => {
  const permission = getPermissionConstant(type);
  const status = await check(permission);

  return {
    granted: status === RESULTS.GRANTED,
    status,
  };
};

// Request a single permission
export const requestPermission = async (
  type: PermissionType,
): Promise<PermissionResult> => {
  const permission = getPermissionConstant(type);
  const status = await request(permission);

  return {
    granted: status === RESULTS.GRANTED,
    status,
  };
};

// Check multiple permissions
export const checkAllPermissions = async (): Promise<{
  camera: PermissionResult;
  microphone: PermissionResult;
}> => {
  const [camera, microphone] = await Promise.all([
    checkPermission('camera'),
    checkPermission('microphone'),
  ]);

  return {camera, microphone};
};

// Request multiple permissions
export const requestAllPermissions = async (): Promise<{
  camera: PermissionResult;
  microphone: PermissionResult;
  allGranted: boolean;
}> => {
  const [camera, microphone] = await Promise.all([
    requestPermission('camera'),
    requestPermission('microphone'),
  ]);

  return {
    camera,
    microphone,
    allGranted: camera.granted && microphone.granted,
  };
};

// Show permission denied alert with option to open settings
export const showPermissionDeniedAlert = (
  permissionType: PermissionType,
): void => {
  const permissionName = permissionType === 'camera' ? 'Camera' : 'Microphone';

  Alert.alert(
    `${permissionName} Permission Required`,
    `${permissionName} access is required for this feature. Would you like to open settings to enable it?`,
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Open Settings',
        onPress: () => openSettings(),
      },
    ],
  );
};

// Handle permission result with automatic alert for denied permissions
export const handlePermissionResult = async (
  type: PermissionType,
): Promise<boolean> => {
  const result = await requestPermission(type);

  if (!result.granted) {
    if (result.status === RESULTS.BLOCKED) {
      showPermissionDeniedAlert(type);
    }
    return false;
  }

  return true;
};

// Check if permissions are permanently blocked
export const arePermissionsBlocked = async (): Promise<{
  camera: boolean;
  microphone: boolean;
}> => {
  const [cameraResult, microphoneResult] = await Promise.all([
    checkPermission('camera'),
    checkPermission('microphone'),
  ]);

  return {
    camera: cameraResult.status === RESULTS.BLOCKED,
    microphone: microphoneResult.status === RESULTS.BLOCKED,
  };
};

export {RESULTS} from 'react-native-permissions';
