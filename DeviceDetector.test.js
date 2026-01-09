// DeviceDetector.test.js
import DeviceDetector from './DeviceDetector';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Mock do DeviceInfo
jest.mock('react-native-device-info', () => ({
  default: {
    getModel: jest.fn(),
    isHeadphonesConnected: jest.fn(),
    getBatteryLevel: jest.fn(),
    isBatteryCharging: jest.fn(),
  }
}));

describe('DeviceDetector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasHeadphoneJack', () => {
    it('should return false for iPhone 15', () => {
      Platform.OS = 'ios';
      DeviceInfo.getModel.mockReturnValue('iPhone 15');
      
      expect(DeviceDetector.hasHeadphoneJack()).toBe(false);
    });

    it('should return true for iPhone 6', () => {
      Platform.OS = 'ios';
      DeviceInfo.getModel.mockReturnValue('iPhone 6');
      
      expect(DeviceDetector.hasHeadphoneJack()).toBe(true);
    });

    it('should return false for Pixel 9', () => {
      Platform.OS = 'android';
      DeviceInfo.getModel.mockReturnValue('Pixel 9');
      
      expect(DeviceDetector.hasHeadphoneJack()).toBe(false);
    });

    it('should return true for Galaxy S10', () => {
      Platform.OS = 'android';
      DeviceInfo.getModel.mockReturnValue('Galaxy S10');
      
      expect(DeviceDetector.hasHeadphoneJack()).toBe(true);
    });
  });

  describe('getBatteryLevel', () => {
    it('should return battery level as percentage', async () => {
      DeviceInfo.getBatteryLevel.mockResolvedValue(0.73);
      
      const level = await DeviceDetector.getBatteryLevel();
      
      expect(level).toBe(73);
    });

    it('should handle errors gracefully', async () => {
      DeviceInfo.getBatteryLevel.mockRejectedValue(new Error('API error'));
      
      const level = await DeviceDetector.getBatteryLevel();
      
      expect(level).toBe(100); // Default fallback
    });
  });

  describe('getDeviceInfo', () => {
    it('should return comprehensive device info', async () => {
      Platform.OS = 'android';
      DeviceInfo.getModel.mockReturnValue('Galaxy S20');
      DeviceInfo.isHeadphonesConnected.mockResolvedValue(true);
      DeviceInfo.getBatteryLevel.mockResolvedValue(0.85);
      DeviceInfo.isBatteryCharging.mockResolvedValue(false);

      const info = await DeviceDetector.getDeviceInfo();

      expect(info).toEqual({
        hasHeadphoneJack: true,
        headphonesConnected: true,
        batteryLevel: 85,
        isCharging: false,
        isAudioPlaying: false,
        platform: 'android',
        model: 'Galaxy S20'
      });
    });
  });

  describe('getStatusMessage', () => {
    it('should recommend USB-C splitter when needed', async () => {
      Platform.OS = 'android';
      DeviceInfo.getModel.mockReturnValue('Pixel 9');
      DeviceInfo.isHeadphonesConnected.mockResolvedValue(false);
      DeviceInfo.getBatteryLevel.mockResolvedValue(0.50);
      DeviceInfo.isBatteryCharging.mockResolvedValue(true);

      const status = await DeviceDetector.getStatusMessage();

      expect(status.recommendation).toBe(
        'You need a USB-C splitter to charge and listen simultaneously'
      );
    });

    it('should recommend charging when battery is low', async () => {
      Platform.OS = 'ios';
      DeviceInfo.getModel.mockReturnValue('iPhone 15');
      DeviceInfo.isHeadphonesConnected.mockResolvedValue(true);
      DeviceInfo.getBatteryLevel.mockResolvedValue(0.15);
      DeviceInfo.isBatteryCharging.mockResolvedValue(false);

      const status = await DeviceDetector.getStatusMessage();

      expect(status.recommendation).toBe('Consider charging your device');
    });
  });
});