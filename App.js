import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import DeviceDetector from './DeviceDetector';

// Initialize BLE manager
const manager = new BleManager();
const deviceDetector = new DeviceDetector(manager);

const DeviceItem = ({ device }) => {
  const getStatusColor = (status) => {
    return status ? '#4CAF50' : '#F44336';
  };

  return (
    <View style={styles.deviceCard}>
      <Text style={styles.deviceName}>{device.name}</Text>
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>P2 Connected:</Text>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(device.isConnected) },
            ]}
          />
          <Text style={{ color: getStatusColor(device.isConnected) }}>
            {device.isConnected ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>Charging:</Text>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(device.isCharging) },
            ]}
          />
          <Text style={{ color: getStatusColor(device.isCharging) }}>
            {device.isCharging ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>Bluetooth:</Text>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(device.isBluetoothConnected) },
            ]}
          />
          <Text style={{ color: getStatusColor(device.isBluetoothConnected) }}>
            {device.isBluetoothConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>
      {device.batteryLevel > 0 && (
        <View style={styles.batteryInfo}>
          <Text style={styles.statusText}>Battery: {device.batteryLevel}%</Text>
        </View>
      )}
    </View>
  );
};

const App = () => {
  const [devices, setDevices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Request Bluetooth and location permissions
  useEffect(() => {
    requestPermissions();
    loadDevices();

    // Set up a listener for Bluetooth state changes
    const subscription = manager.onStateChange((state) => {
      console.log('Bluetooth state changed:', state);
      if (state === 'PoweredOn') {
        console.log('Bluetooth is powered on, scanning for devices...');
        scanForP2Devices();
      } else {
        Alert.alert('Bluetooth', `Bluetooth state is ${state}. Please enable Bluetooth to detect devices.`);
      }
    }, true);

    return () => {
      subscription.remove();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // Request location permission for Bluetooth scanning
        const locationResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        
        console.log('Location permission result:', locationResult);
        
        // Request Bluetooth permissions on Android 12+
        if (Platform.Version >= 31) {
          const connectResult = await PermissionsAndroid.request(
            'android.permission.BLUETOOTH_CONNECT'
          );
          const scanResult = await PermissionsAndroid.request(
            'android.permission.BLUETOOTH_SCAN',
            {
              title: 'Bluetooth Permission',
              message: 'This app needs Bluetooth permissions to connect to P2 devices',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          console.log('Bluetooth permissions:', { connect: connectResult, scan: scanResult });
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const scanForP2Devices = async () => {
    console.log('Starting scan for P2 devices...');
    try {
      const p2Devices = await deviceDetector.scanForP2Devices(5000); // 5 second scan
      console.log('Found P2 devices:', p2Devices);
      
      setDevices(prevDevices => [
        ...prevDevices.filter(d => !p2Devices.some(newDevice => newDevice.id === d.id)), // Keep non-P2 devices
        ...p2Devices
      ]);
    } catch (error) {
      console.error('Error scanning for P2 devices:', error);
    }
  };

  const loadDevices = async () => {
    console.log('Loading connected devices...');
    try {
      // Get already connected P2 devices
      const connectedP2Devices = await deviceDetector.getConnectedP2Devices();
      console.log('Connected P2 devices:', connectedP2Devices);

      // Get all currently connected devices
      const allConnectedDevices = await manager.connectedDevices([]);
      console.log('All connected devices:', allConnectedDevices);

      // Filter for P2 devices among all connected devices
      const allP2Devices = allConnectedDevices
        .filter(device => deviceDetector.isP2Device(device))
        .map(device => ({
          id: device.id,
          name: device.name || 'Unknown P2 Device',
          isConnected: true,
          isCharging: false, // Would need specific service to detect
          isBluetoothConnected: true,
          batteryLevel: 0, // Would be read from battery service
        }));

      console.log('All P2 devices from connected:', allP2Devices);

      // Combine connected P2 devices with the special charging status
      const combinedDevices = [...connectedP2Devices, ...allP2Devices];

      // Remove duplicates
      const uniqueDevices = combinedDevices.filter((device, index, self) =>
        index === self.findIndex(d => d.id === device.id)
      );

      console.log('Unique devices to display:', uniqueDevices);
      
      setDevices(uniqueDevices);
    } catch (error) {
      console.log('Error loading devices:', error);
      // For debugging, let's add some mock devices if there's an error
      setDevices([
        {
          id: 'debug-1',
          name: 'Debug P2 Device',
          isConnected: true,
          isCharging: false,
          isBluetoothConnected: true,
          batteryLevel: 75,
        }
      ]);
    }
  };

  const onRefresh = () => {
    console.log('Refreshing devices...');
    setRefreshing(true);
    loadDevices().then(() => {
      setRefreshing(false);
    });
  };

  const renderDevice = ({ item }) => <DeviceItem device={item} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connected P2 Devices</Text>
      </View>
      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No P2 devices found</Text>
            <Text style={styles.emptySubtext}>Make sure your P2 device is nearby and powered on</Text>
            <Text style={styles.debugText}>Debug: Check console for Bluetooth state and permission info</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  listContainer: {
    padding: 10,
  },
  deviceCard: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginRight: 5,
    color: '#666',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  batteryInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default App;