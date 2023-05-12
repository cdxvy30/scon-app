package com.testconnection;

import com.facebook.react.ReactActivity;
import android.content.Intent;
import android.content.res.Configuration;
import org.wonday.orientation.OrientationActivityLifecycle;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "TestConnection";
  }
  public void onConfigurationChanged(Configuration newConfig) {
      super.onConfigurationChanged(newConfig);
      Intent intent = new Intent("onConfigurationChanged");
      intent.putExtra("newConfig", newConfig);
      this.sendBroadcast(intent);
  }
  public void onCreate() {
    registerActivityLifecycleCallbacks(OrientationActivityLifecycle.getInstance());
  }
}
