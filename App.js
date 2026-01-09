import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
} from 'react-native';
import DeviceDetector from './DeviceDetector';

// Status indicator component
const StatusIndicator = ({ status }) => (
  <View style={status ? styles.statusIndicatorYes : styles.statusIndicatorNo} />
);

// Status item component
const StatusItem = ({ label, status, value }) => (
  <View style={styles.statusItem}>
    <Text style={styles.statusText}>{label}</Text>
    {value !== undefined ? (
      <Text style={styles.statusValue}>: {value}</Text>
    ) : (
      <>
        <StatusIndicator status={status} />
        <Text style={status ? styles.statusTextYes : styles.statusTextNo}>
          {status ? 'Yes' : 'No'}
        </Text>
      </>
    )}
  </View>
);

const App = () => {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      setLoading(true);
      // Get comprehensive device info including headphone jack, battery, and audio status
      const info = await DeviceDetector.getDeviceInfo();
      setDeviceInfo(info);
      console.log('Device info:', info);
    } catch (error) {
      console.error('Error getting device info:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    loadDeviceInfo();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Device Status Monitor</Text>
      </View>
      <View style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Checking device status...</Text>
        ) : deviceInfo ? (
          <View style={styles.infoCard}>
            <Text style={styles.deviceInfo}>
              Platform: {deviceInfo.platform}
            </Text>
            <View style={styles.statusContainer}>
              <StatusItem
                label="Has P2 Jack"
                status={deviceInfo.hasHeadphoneJack}
              />
              <StatusItem
                label="Headphones Connected"
                status={deviceInfo.headphonesConnected}
              />
              <StatusItem
                label="Battery Level"
                value={`${deviceInfo.batteryLevel}%`}
              />
              <StatusItem
                label="Charging"
                status={deviceInfo.isCharging}
              />
              <StatusItem
                label="Audio Playing"
                status={deviceInfo.isAudioPlaying}
              />
            </View>
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                Note: P2 refers to the 3.5mm headphone jack, commonly used in Brazil.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading device info</Text>
          </View>
        )}
      </View>
      <View style={styles.refreshContainer}>
        <View style={styles.refreshButton}
          onTouchStart={onRefresh}
          >
          <Text style={styles.refreshText}>Refresh</Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  deviceInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  statusTextYes: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusTextNo: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
  },
  statusValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusIndicatorYes: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#4CAF50',
  },
  statusIndicatorNo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#F44336',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    textAlign: 'center',
  },
  noteContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    width: '100%',
  },
  noteText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  refreshContainer: {
    alignItems: 'center',
    padding: 20,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  refreshText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;