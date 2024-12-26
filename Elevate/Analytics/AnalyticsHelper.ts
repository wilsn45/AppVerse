import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import analytics from '@react-native-firebase/analytics';

enum ActionType {
  IMPRESSION = 'impression',
  CLICK = 'click',
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
    eventId: string,
    eventName: string,
    screen: string,
    subSection: string,
    actionType: ActionType,
    option: string,
    params: AnalyticsParams = {}
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const appVersion = await this.getAppVersion();
      const deviceOs = this.getOS();
      const deviceId = await this.getDeviceId();

      const eventData = {
        eventId,
        eventName,
        screen,
        subSection,
        actionType,
        option,
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
        eventId: eventData.eventId,
        screen: eventData.screen,
        subSection: eventData.subSection,
        actionType: eventData.actionType,
        option: eventData.option,
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
