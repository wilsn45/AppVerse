import AsyncStorage from '@react-native-async-storage/async-storage';

export class AdMobDBManager {
  private static STORAGE_KEY = 'SHOW_AD_COUNTER';

  public static readonly ANDROID_APP_ID = 'ca-app-pub-4487612939766083~1957203592';
  public static readonly IOS_APP_ID = 'ca-app-pub-4487612939766083~1872593054';


  static async showInterstitialAds(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.STORAGE_KEY);
      const count = value ? parseInt(value, 10) : 0;

      if (count < 2) {
        await AsyncStorage.setItem(this.STORAGE_KEY, (count + 1).toString());
        return false;
      } else {
        await AsyncStorage.setItem(this.STORAGE_KEY, '0');
        return true;
      }
    } catch (error) {
      console.error('Error in showInterstitialAds:', error);
      return false;
    }
  }
  }
