import React from 'react';
import { NativeModules } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';

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

  static async saveReferralData(): Promise<void> {
    try {
      
       const referrer: string = await InstallReferrer.getReferrer();
       const params = this.parseReferrerString(referrer);
      const influencerCode = params['utm_source'] || 'Organic';
      const deviceId =  await DeviceInfo.getUniqueId();

      const docRef = firestore().collection('UserReferrals').doc(deviceId); // just the reference
      const docSnapshot = await docRef.get(); // fetch snapshot using .get()
       console.log("Add influencer entry");
       console.log("Add influencer entry 2", docSnapshot);
      if (!docSnapshot.exists) {
          console.log("Add influencer entry 3");
           await docRef.set({
               influencerCode,
               deviceId,
              referrer,
              createdAt: firestore.FieldValue.serverTimestamp(),
        });
      console.log('Referral data saved to Firebase');
      } else {
          console.log('Referral already exists. Skipping save.');
      }
    } catch (error) {
      console.error('Failed to get or save referrer:', error);
    }
  }

  static async addAdImpression(courseId: string, chapterId: string): Promise<void> {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    const docRef = firestore().collection('AdsImpression').doc(deviceId);

    const newEntry = {
      timestamp: firestore.Timestamp.now(), // avoid using serverTimestamp() for local processing
      courseId,
      chapterId,
    };

    const docSnapshot = await docRef.get();

    let updatedList = [];

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      const currentList = Array.isArray(data?.InterstitialList) ? data.InterstitialList : [];
      //console.log('Current InterstitialList:', currentList);
      updatedList = [...currentList, newEntry];
      //console.log('currentList type:', typeof currentList, Array.isArray(currentList), currentList);
    } else {
      updatedList = [newEntry];
    }

    await docRef.set(
      {
        InterstitialList: updatedList,
      },
      { merge: true }
    );

   // console.log('Ad impression updated successfully:', newEntry);
  } catch (error) {
    console.error('Failed to log ad impression:', error);
  }
}
}
