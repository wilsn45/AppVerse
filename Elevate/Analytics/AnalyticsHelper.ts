import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import analytics from '@react-native-firebase/analytics';

enum ActionType {
  IMPRESSION = 'impression',
  CLICK = 'click',
  NAVIGATION = 'Navigation',
  NETWORK = 'Network'
}

interface AnalyticsParams {
  [key: string]: any;
}

class AnalyticsHelper {
  private static async getDeviceId(): Promise<string> {
    return await DeviceInfo.getUniqueId();
  }

  private static async getAppVersion(): Promise<string> {
    return await DeviceInfo.getVersion();
  }

  private static getOS(): string {
    return Platform.OS;
  }

  public static async sendEvent(
    eventName: string,
    screen: string,
    actionType: ActionType,
    params: AnalyticsParams = {}
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const appVersion = await this.getAppVersion();
      const deviceOs = this.getOS();
      const deviceId = await this.getDeviceId();

      const eventData = {
        eventName,
        screen,
        actionType,
        params,
        metadata: {
          timestamp,
          appVersion,
          deviceOs,
          deviceId,
        },
      };

      console.log('Sending analytics event:', eventData);

      // Send data to Google Analytics using Firebase Analytics
      await analytics().logEvent(eventName, {
        ...eventData.params,
        screen: eventData.screen,
        actionType: eventData.actionType,
        timestamp: eventData.metadata.timestamp,
        appVersion: eventData.metadata.appVersion,
        deviceOs: eventData.metadata.deviceOs,
        deviceId: eventData.metadata.deviceId,
      });

      //console.log('Event sent successfully.');
    } catch (error) {
      console.error('Error sending analytics event:', error);
    }
  }
}

export { AnalyticsHelper, ActionType };
