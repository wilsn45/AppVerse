package com.nextworklab.elevate

import android.util.Log
import com.facebook.react.bridge.*
import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener

class InstallReferrerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val TAG = "InstallReferrerModule"

    override fun getName(): String {
        return "InstallReferrer"
    }

    @ReactMethod
    fun getReferrer(promise: Promise) {
        val referrerClient = InstallReferrerClient.newBuilder(reactApplicationContext).build()
        referrerClient.startConnection(object : InstallReferrerStateListener {
            override fun onInstallReferrerSetupFinished(responseCode: Int) {
                when (responseCode) {
                    InstallReferrerClient.InstallReferrerResponse.OK -> {
                        try {
                            val response = referrerClient.installReferrer
                            val referrerUrl = response.installReferrer
                            promise.resolve(referrerUrl)
                        } catch (e: Exception) {
                            promise.reject("ERR_REFERRER", e.message)
                        } finally {
                            referrerClient.endConnection()
                        }
                    }
                    InstallReferrerClient.InstallReferrerResponse.FEATURE_NOT_SUPPORTED -> {
                        promise.reject("ERR_REFERRER", "Feature not supported")
                        referrerClient.endConnection()
                    }
                    InstallReferrerClient.InstallReferrerResponse.SERVICE_UNAVAILABLE -> {
                        promise.reject("ERR_REFERRER", "Service unavailable")
                        referrerClient.endConnection()
                    }
                    else -> {
                        promise.reject("ERR_REFERRER", "Unknown error")
                        referrerClient.endConnection()
                    }
                }
            }

            override fun onInstallReferrerServiceDisconnected() {
                Log.w(TAG, "Install Referrer service disconnected")
            }
        })
    }
}
