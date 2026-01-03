# Device Connectivity App

This React Native application displays a list of connected P2 devices showing their connection status, charging status, and Bluetooth connectivity.

## Features

- Lists all connected P2 devices
- Shows P2 connection status (Yes/No)
- Shows charging status (Yes/No)
- Shows Bluetooth connection status (Connected/Disconnected)
- Displays battery level when available
- Pull-to-refresh to update device list
- Empty state when no P2 devices are found
- Proper permissions handling for Bluetooth

## Technical Implementation

- Uses `react-native-ble-plx` for Bluetooth Low Energy functionality
- Implements custom device detection for P2 devices
- Handles platform-specific permissions for iOS and Android
- Provides visual indicators for device status with color coding

## Permissions

The app requires the following permissions:
- Bluetooth permission for device discovery
- Location permission (required for Bluetooth scanning on Android)
- iOS-specific Bluetooth usage descriptions

## How It Works

The application:
1. Scans for Bluetooth devices
2. Filters for P2 devices based on name patterns
3. Checks connection status and battery level
4. Updates the UI with real-time device status
5. Provides a refresh mechanism to rescan for devices

## Customization

To customize for specific P2 device requirements:
1. Update the service UUIDs in `DeviceDetector.js`
2. Modify the name patterns used to identify P2 devices
3. Implement custom characteristics for charging status if supported by your P2 devices