package com.findmyspace.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        splashScreen.setOnExitAnimationListener(splashScreenView -> {
            splashScreenView.getView().animate()
                .alpha(0f)
                .setDuration(500)
                .withEndAction(splashScreenView::remove)
                .start();
        });
        super.onCreate(savedInstanceState);
    }
}