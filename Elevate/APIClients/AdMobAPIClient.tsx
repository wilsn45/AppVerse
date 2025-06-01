import React from 'react';
import { Platform } from 'react-native';
import { AdMobDBHandler } from '../DBHandler/AdMobDBHandler';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

export default class AdMobAPIClient {
  // Static property to hold interstitial ad instance
  static interstitial = InterstitialAd.createForAdRequest(
    Platform.select({
      ios: AdMobDBHandler.IOS_INTERSTITIAL_AD_ID,
      android: AdMobDBHandler.ANDROID_INTERSTITIAL_AD_ID,
      default: TestIds.INTERSTITIAL, // fallback to test ID if none found
    }) || TestIds.INTERSTITIAL, // fallback if Platform.select returns undefined
    {
      requestNonPersonalizedAdsOnly: true,
    }
  );

  static async showInterstitialAd() {
    return new Promise((resolve, reject) => {
      try {
        let unsubscribeLoaded: () => void;
        let unsubscribeClosed: () => void;
        let unsubscribeError: () => void;

        unsubscribeLoaded = this.interstitial.addAdEventListener(
          AdEventType.LOADED,
          () => {
            this.interstitial.show();
          }
        );

        unsubscribeClosed = this.interstitial.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            unsubscribeLoaded?.();
            unsubscribeClosed?.();
            unsubscribeError?.();
            resolve();
          }
        );

        unsubscribeError = this.interstitial.addAdEventListener(
          AdEventType.ERROR,
          (error) => {
            unsubscribeLoaded?.();
            unsubscribeClosed?.();
            unsubscribeError?.();
            console.log('Interstitial Ad Error:', error);
            reject(error);
          }
        );

        this.interstitial.load();
      } catch (error) {
        console.log('Ad load exception:', error);
        reject(error);
      }
    });
  }
}
