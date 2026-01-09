# DevList

React Native app for device hardware detection.

## Features
- Headphone jack detection
- Battery monitoring  
- Audio output status
- Device info aggregation

## Quick Start

bash
npm install
npm start
npm run android # or npm run ios

## Usage

javascript
import DeviceDetector from './DeviceDetector';
const info = await DeviceDetector.getDeviceInfo();
console.log(info);


## Build

bash
cd android
./gradlew assembleRelease

## License
MIT
