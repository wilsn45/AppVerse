import { AnalyticsHelper, ActionType } from './AnalyticsHelper';

export class SplashAnalytics {

 async sendSplashImpressionEvent() {
    await AnalyticsHelper.sendEvent(
        '8.0.0',
        'Splash_Appeared',
        'Splash',
        '',
        ActionType.IMPRESSION,
        '',
        {}
      );
  }

  async sendNavigateToLetsStartEvent() {
    await AnalyticsHelper.sendEvent(
        '8.1.0.1',
        'Navigate_LetsStart',
        'Splash',
        '',
        ActionType.IMPRESSION,
        '',
        {}
      );
  }

  async sendNavigateToHomeEvent() {
    await AnalyticsHelper.sendEvent(
        '8.1.0.2',
        'Navigate_Home',
        'Splash',
        '',
        ActionType.IMPRESSION,
        '',
        {}
      );
  }
}