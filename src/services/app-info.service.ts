//import DeviceInfo from 'react-native-device-info';

export class AppInfoService {

  static getVersion = (): string => {
    return '4.0.1';//DeviceInfo.getVersion();
  };

  static getBuildNumber = (): string => {
    return '4.0.1';//DeviceInfo.getBuildNumber();
  };
}
