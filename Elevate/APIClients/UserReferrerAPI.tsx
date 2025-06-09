import React from 'react';
import { NativeModules } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { AdMobDBHandler } from '../DBHandler/AdMobDBHandler';
const { InstallReferrer } = NativeModules;

export default class UserReferrerAPI {
  private static parseReferrerString(referrer: string | null | undefined): Record<string, string> {
  const params: Record<string, string> = {};
  if (!referrer || typeof referrer !== 'string') {
    console.warn('parseReferrerString got invalid input:', referrer);
    return params;
  }
  referrer.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });
  return params;
}

static async saveReferralData() {
  console.log('Updating Referrer');
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    const referrer = await InstallReferrer.getReferrer();
    const params = this.parseReferrerString(referrer);
    const influencerCode =  params.utm_source || 'Organic';
    const deviceId = await DeviceInfo.getUniqueId();

    const docRef = firestore().collection('UserReferrals').doc(deviceId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      await docRef.set({
        influencerCode,
        deviceId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      AdMobDBHandler.setReferStateDone();
      //console.log('Referral data saved to Firebase');
    } else {
      AdMobDBHandler.setReferStateDone();
      //console.log('Referral already exists. Skipping save.');
    }
  } catch (error) {
    //console.error('Failed to get or save referrer:', error);
  }
}



 static async addAdImpression(courseId, chapterId) {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    const docRef = firestore().collection('AdsImpression').doc(deviceId);

    const newEntry = {
      timestamp: firestore.Timestamp.now(),
      courseId,
      chapterId,
    };

    const docSnapshot = await docRef.get();

    let updatedList = [];

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      const currentList = Array.isArray(data?.InterstitialList) ? data.InterstitialList : [];
      updatedList = [...currentList, newEntry];
      console.log('Impression Added');
    } else {
      updatedList = [newEntry];
    }

    await docRef.set(
      {
        InterstitialList: updatedList,
      },
      { merge: true }
    );

  } catch (error) {
    console.error('Failed to log ad impression:', error);
  }
}

}
