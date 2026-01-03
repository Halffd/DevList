// DeviceDetector.js
import { BleManager } from 'react-native-ble-plx';

// P2 device service UUIDs
// These are placeholders - replace with actual P2 device UUIDs
const P2_SERVICE_UUIDS = [
  '180F', // Battery Service
  '180A', // Device Information Service
  // Add actual P2 service UUIDs here
];

// P2 device name patterns
const P2_NAME_PATTERNS = [
  /P2/i,
  /P2_/i,
  /Device_P2/i,
];

// Battery characteristic UUID (standard GATT characteristic)
const BATTERY_LEVEL_CHARACTERISTIC = '2A19';

class DeviceDetector {
  constructor(bleManager) {
    this.manager = bleManager;
    this.devices = new Map();
  }

  // Check if a device name matches P2 device pattern
  isP2Device(device) {
    if (!device.name) return false;
    
    return P2_NAME_PATTERNS.some(pattern => pattern.test(device.name));
  }

  // Get device battery level
  async getBatteryLevel(device) {
    try {
      if (!device.isConnected) {
        await device.connect();
      }
      
      const batteryService = await device.discoverAllServicesAndCharacteristics();
      const batteryCharacteristic = await device.readCharacteristicForService(
        '180F', // Battery service UUID
        BATTERY_LEVEL_CHARACTERISTIC
      );
      
      // Battery level is typically provided as a percentage (0-100)
      const batteryValue = batteryCharacteristic.value;
      if (batteryValue) {
        // Convert from hex to decimal
        return parseInt(batteryValue, 16);
      }
      
      return 0;
    } catch (error) {
      console.warn('Could not read battery level:', error.message);
      return 0;
    }
  }

  // Check if device is charging
  // This would require a custom characteristic from P2 devices
  async isCharging(device) {
    // This is a placeholder implementation
    // Actual implementation would read a custom characteristic
    // that indicates charging status
    return false;
  }

  // Connect to a device
  async connectToDevice(deviceId) {
    try {
      const device = await this.manager.device(deviceId);
      if (!device.isConnected) {
        await device.connect();
        await device.discoverAllServicesAndCharacteristics();
      }
      return device;
    } catch (error) {
      console.error('Connection error:', error);
      return null;
    }
  }

  // Scan for P2 devices
  async scanForP2Devices(timeout = 10000) {
    const p2Devices = [];

    return new Promise((resolve) => {
      const subscription = this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
          this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
              console.error('Scan error:', error);
              resolve(p2Devices);
              return;
            }

            if (device && this.isP2Device(device)) {
              // Add the P2 device to our list
              p2Devices.push({
                id: device.id,
                name: device.name || 'Unknown P2 Device',
                isConnected: device.isConnected,
                isCharging: false,
                isBluetoothConnected: device.isConnected,
                batteryLevel: 0,
              });
              
              // Get more details for connected devices
              if (device.isConnected) {
                this.getBatteryLevel(device).then(batteryLevel => {
                  const existingDevice = p2Devices.find(d => d.id === device.id);
                  if (existingDevice) {
                    existingDevice.batteryLevel = batteryLevel;
                  }
                });
              }
            }
          });

          // Stop scanning after timeout
          setTimeout(() => {
            this.manager.stopDeviceScan();
            subscription.remove();
            resolve(p2Devices);
          }, timeout);
        } else {
          console.log('Bluetooth is not powered on');
          resolve(p2Devices);
        }
      }, true);
    });
  }
  
  // Get connected P2 devices
  async getConnectedP2Devices() {
    try {
      const connectedDevices = await this.manager.connectedDevices([]);
      const p2Devices = [];
      
      for (const device of connectedDevices) {
        if (this.isP2Device(device)) {
          let batteryLevel = 0;
          
          // Try to get battery level
          try {
            batteryLevel = await this.getBatteryLevel(device);
          } catch (error) {
            console.warn('Could not get battery level for device:', device.id);
          }
          
          // Check if charging (placeholder)
          const isChargingStatus = await this.isCharging(device);
          
          p2Devices.push({
            id: device.id,
            name: device.name || 'Unknown P2 Device',
            isConnected: true,
            isCharging: isChargingStatus,
            isBluetoothConnected: true,
            batteryLevel: batteryLevel,
          });
        }
      }
      
      return p2Devices;
    } catch (error) {
      console.error('Error getting connected devices:', error);
      return [];
    }
  }
}

export default DeviceDetector;