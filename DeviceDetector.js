// Em um componente React Native
import DeviceDetector from './DeviceDetector';

const MyComponent = () => {
  useEffect(() => {
    async function checkDevice() {
      const info = await DeviceDetector.getDeviceInfo();
      console.log('Device Info:', info);
      
      const status = await DeviceDetector.getStatusMessage();
      console.log('Status:', status);
      
      // {
      //   audio: "No headphones connected",
      //   battery: "73% (charging)",
      //   recommendation: "Get a USB-C to 3.5mm adapter or Bluetooth headphones"
      // }
    }
    
    checkDevice();
  }, []);

  return (
    <View>
      {/* Seu componente */}
    </View>
  );
};
