//import DeviceInfo from 'react-native-device-info';

export class AppInfoService {

  static getVersion = (): string => {
    return '1.0.0';//DeviceInfo.getVersion();
  };

  static getBuildNumber = (): string => {
    return '1.0.0';//DeviceInfo.getBuildNumber();
  };
}
