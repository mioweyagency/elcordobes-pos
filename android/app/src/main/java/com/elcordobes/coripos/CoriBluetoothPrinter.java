
package com.elcordobes.coripos;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.PluginMethod;

import java.util.Set;

@CapacitorPlugin(
    name = "CoriBluetoothPrinter",
    permissions = {
        @Permission(
            alias = "bluetoothConnect",
            strings = {
                Manifest.permission.BLUETOOTH_CONNECT
            }
        )
    }
)
public class CoriBluetoothPrinter extends Plugin {

    private BluetoothAdapter bluetoothAdapter;

    @Override
    public void load() {
        super.load();

        BluetoothManager manager =
            (BluetoothManager) getContext()
                .getSystemService(Context.BLUETOOTH_SERVICE);

        bluetoothAdapter = manager != null
            ? manager.getAdapter()
            : null;
    }

    @PluginMethod
    public void checkBluetooth(PluginCall call) {

        if (bluetoothAdapter == null) {
            call.reject(
                "Este dispositivo no tiene Bluetooth."
            );
            return;
        }

        if (!hasBluetoothPermission()) {
            requestPermissionForAlias(
                "bluetoothConnect",
                call,
                "bluetoothPermissionCallback"
            );
            return;
        }

        returnBluetoothStatus(call);
    }

    @PermissionCallback
    private void bluetoothPermissionCallback(
        PluginCall call
    ) {
        if (!hasBluetoothPermission()) {
            call.reject(
                "Permiso Bluetooth denegado."
            );
            return;
        }

        returnBluetoothStatus(call);
    }

    private void returnBluetoothStatus(
        PluginCall call
    ) {
        JSObject result = new JSObject();

        result.put(
            "available",
            bluetoothAdapter != null
        );

        result.put(
            "enabled",
            bluetoothAdapter != null
                && bluetoothAdapter.isEnabled()
        );

        call.resolve(result);
    }

    @PluginMethod
    public void getPairedDevices(
        PluginCall call
    ) {
        if (bluetoothAdapter == null) {
            call.reject(
                "Bluetooth no disponible."
            );
            return;
        }

        if (!hasBluetoothPermission()) {
            requestPermissionForAlias(
                "bluetoothConnect",
                call,
                "pairedDevicesPermissionCallback"
            );
            return;
        }

        returnPairedDevices(call);
    }

    @PermissionCallback
    private void pairedDevicesPermissionCallback(
        PluginCall call
    ) {
        if (!hasBluetoothPermission()) {
            call.reject(
                "Permiso Bluetooth denegado."
            );
            return;
        }

        returnPairedDevices(call);
    }

    private void returnPairedDevices(
        PluginCall call
    ) {
        if (!bluetoothAdapter.isEnabled()) {
            call.reject(
                "Activa Bluetooth en la tablet."
            );
            return;
        }

        try {
            Set<BluetoothDevice> devices =
                bluetoothAdapter.getBondedDevices();

            JSArray deviceList = new JSArray();

            for (BluetoothDevice device : devices) {
                JSObject item = new JSObject();

                item.put(
                    "name",
                    device.getName() != null
                        ? device.getName()
                        : "Dispositivo Bluetooth"
                );

                item.put(
                    "address",
                    device.getAddress()
                );

                deviceList.put(item);
            }

            JSObject result = new JSObject();
            result.put("devices", deviceList);

            call.resolve(result);

        } catch (SecurityException error) {
            call.reject(
                "No hay permiso para consultar Bluetooth.",
                error
            );
        } catch (Exception error) {
            call.reject(
                "Error al consultar dispositivos.",
                error
            );
        }
    }

    private boolean hasBluetoothPermission() {
        if (Build.VERSION.SDK_INT
                < Build.VERSION_CODES.S) {
            return true;
        }

        return getContext().checkSelfPermission(
            Manifest.permission.BLUETOOTH_CONNECT
        ) == PackageManager.PERMISSION_GRANTED;
    }
}
