# DevList 📱

A React Native application for detecting device hardware capabilities, with focus on audio connectivity and battery monitoring.

[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
[![React Native](https://img.shields.io/badge/React%20Native-0.82-blue.svg)](https://reactnative.dev/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green.svg)](https://reactnative.dev/)

## Overview

DevList helps developers and users understand their device's hardware capabilities, particularly around audio connectivity. Born from the frustration of the headphone jack removal era (2016-present), this utility provides programmatic access to device features that used to be taken for granted.

## Features ✨

### Core Functionality
- 🎧 **Headphone Jack Detection** - Determines if device has physical 3.5mm audio port
- 🔌 **Audio Output Status** - Real-time monitoring of wired/Bluetooth headphone connections
- 🔋 **Battery Monitoring** - Track battery level and charging state
- 📊 **Device Information** - Aggregate hardware capabilities in one call
- 💡 **Smart Recommendations** - Suggests accessories based on device limitations

### Platform Support
- ✅ Android (tested on 5.0+)
- ✅ iOS (tested on 11.0+)
- ✅ Expo compatible (with custom dev client)

## Installation 🚀

### Prerequisites
- Node.js >= 18
- React Native CLI or Expo
- Java 21 (for Android builds)
- Android Studio or Xcode

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/DevList.git
cd DevList

# Install dependencies
npm install

# iOS only - Install CocoaPods dependencies
cd ios && pod install && cd ..

# Start Metro bundler
npm start

```

### Run on Device

```bash
# Android
npm run android

# iOS
npm run ios

```

## Usage 📖

### Basic Example

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DeviceDetector from './DeviceDetector';

export default function App() {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function loadDeviceInfo() {
      const info = await DeviceDetector.getDeviceInfo();
      const statusMsg = await DeviceDetector.getStatusMessage();

      setDeviceInfo(info);
      setStatus(statusMsg);
    }

    loadDeviceInfo();
  }, []);

  if (!deviceInfo) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Info</Text>

      <Text>Model: {deviceInfo.model}</Text>
      <Text>Platform: {deviceInfo.platform}</Text>
      <Text>Has Headphone Jack: {deviceInfo.hasHeadphoneJack ? '✅' : '❌'}</Text>
      <Text>Headphones Connected: {deviceInfo.headphonesConnected ? '✅' : '❌'}</Text>
      <Text>Battery: {deviceInfo.batteryLevel}%</Text>
      <Text>Charging: {deviceInfo.isCharging ? '⚡' : '🔋'}</Text>

      {status?.recommendation && (
        <Text style={styles.recommendation}>
          💡 {status.recommendation}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  recommendation: { marginTop: 20, fontStyle: 'italic', color: '#666' }
});

```

### API Reference

#### `DeviceDetector.hasHeadphoneJack()`
Returns `boolean` indicating if device has physical 3.5mm port (synchronous).

#### `DeviceDetector.isHeadphonesConnected()`
Returns `Promise<boolean>` - true if any audio device is connected.

#### `DeviceDetector.getBatteryLevel()`
Returns `Promise<number>` - battery percentage (0-100).

#### `DeviceDetector.isCharging()`
Returns `Promise<boolean>` - true if device is currently charging.

#### `DeviceDetector.getDeviceInfo()`
Returns comprehensive device information:
```typescript
{
  hasHeadphoneJack: boolean;
  headphonesConnected: boolean;
  batteryLevel: number;
  isCharging: boolean;
  isAudioPlaying: boolean;
  platform: 'ios' | 'android';
  model: string;
}

```

#### `DeviceDetector.getStatusMessage()`
Returns user-friendly status messages and recommendations:
```typescript
{
  audio: string;
  battery: string;
  recommendation: string | null;
}

```

## Building for Production 🏗️

### Android

```bash
# Generate signing key (first time only)
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/app/release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Add to ~/.gradle/gradle.properties
MYAPP_RELEASE_STORE_FILE=release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_password
MYAPP_RELEASE_KEY_PASSWORD=your_password

# Build release APK
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk

```

### iOS

Open `ios/DevList.xcworkspace` in Xcode, select Generic iOS Device, then Product > Archive.

## Dependencies 📦

```json
{
  "react-native-device-info": "^10.14.0"
}

```

See `package.json` for complete dependency list.

## Architecture 🏛️

```
DevList/
├── App.js                    # Main application entry point
├── DeviceDetector.js         # Core detection utility (platform-agnostic)
├── android/                  # Android native configuration
│   ├── app/
│   │   ├── build.gradle      # Build configuration
│   │   └── src/              # Native Android code
│   └── gradle.properties     # Build properties
├── ios/                      # iOS native configuration
├── node_modules/             # Dependencies
└── package.json              # Project metadata

```

## Troubleshooting 🔧

### Common Issues

**Metro bundler port conflict**
```bash
lsof -ti:8081 | xargs kill -9
npm start -- --reset-cache

```

**Android build fails with CMake errors**
```bash
rm -rf android/.gradle android/app/build node_modules
npm install
cd android && ./gradlew clean

```

**Keystore password incorrect**
Verify credentials in `~/.gradle/gradle.properties` or regenerate keystore (non-production only).

## Contributing 🤝

Contributions are welcome! This project is licensed under GPL v2.0, which means:

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Follow conventional commits (`feat:`, `fix:`, `docs:`, etc.)
4. Ensure your code is GPL v2.0 compatible
5. Submit a Pull Request

Any modifications or derivatives must also be released under GPL v2.0.

## License 📜

Copyright (C) 2025 DevList Contributors

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.

See [LICENSE](LICENSE) for full details.

## The Headphone Jack Saga 📖

This project exists as a response to the 2016-present trend of removing the 3.5mm headphone jack from smartphones. What was marketed as "courage" and "innovation" created real usability problems:

- Inability to charge while using wired audio
- Forced adoption of Bluetooth with inherent latency
- Additional dongles and adapters required
- E-waste from incompatible accessories

DevList provides developers tools to detect these limitations and recommend solutions to affected users.

## Acknowledgments 🙏

- React Native community
- Contributors to react-native-device-info
- The /g/ community for documenting hardware regressions since 2016
- Everyone who refused to accept "you're holding it wrong"

## Contact & Support 📧

- **Issues**: [GitHub Issues](https://github.com/yourusername/DevList/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/DevList/discussions)
- **Pull Requests**: Always welcome!

---
