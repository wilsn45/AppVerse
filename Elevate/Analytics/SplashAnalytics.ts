import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class SplashAnalytics {

 async sendSplashImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        'Splash_Appeared',
        'Splash',
         ActionType.IMPRESSION,
        {}
      );
  }

  async sendNavigateToHomeEvent() {
    await AnalyticsHelper.sendEvent(
        'Navigate_To_Home',
        'Splash',
        ActionType.NAVIGATION,
        {}
      );
  }
}