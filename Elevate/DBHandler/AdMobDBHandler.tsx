import AsyncStorage from '@react-native-async-storage/async-storage';

export class AdMobDBHandler {
  private static AD_STORAGE_KEY = 'SHOW_AD_COUNTER';

  private static REFER_STORAGE_KEY = 'REFER_STORAGE_KEY';

  public static readonly ANDROID_APP_ID = 'ca-app-pub-4487612939766083~1957203592';
  public static readonly IOS_APP_ID = 'ca-app-pub-4487612939766083~1872593054';

  static IOS_INTERSTITIAL_AD_ID = 'ca-app-pub-4487612939766083/2365000345';
   static ANDROID_INTERSTITIAL_AD_ID = 'ca-app-pub-4487612939766083/2365000345';
  // static ANDROID_INTERSTITIAL_AD_ID = 'ca-app-pub-3940256099942544/1033173712';   //TEST INTERSTITIAL ID


  static async showInterstitialAds(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.AD_STORAGE_KEY);
      const count = value ? parseInt(value, 10) : 0;

      if (count < 2) {
        await AsyncStorage.setItem(this.AD_STORAGE_KEY, (count + 1).toString());
        return false;
      } else {
        await AsyncStorage.setItem(this.AD_STORAGE_KEY, '0');
        return true;
      }
    } catch (error) {
      console.error('Error in showInterstitialAds:', error);
      return false;
    }
  }

  static async setReferStateDone() {
    try {
      await AsyncStorage.setItem(this.REFER_STORAGE_KEY, 'true');
    } catch (error) {
      console.error('Error setting refer flag:', error);
    }
  }

  // ✅ Gets REFER_STORAGE_KEY value, defaults to false
  static async getReferState(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(this.REFER_STORAGE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error getting refer flag:', error);
      return false;
    }
  }


  }
