
package com.elcordobes.coripos;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CoriBluetoothPrinter.class);
        super.onCreate(savedInstanceState);
    }
}
