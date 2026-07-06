package com.rmdka.pingdomapp

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.common.model.RemoteModelManager
import com.google.mlkit.nl.languageid.LanguageIdentification
import com.google.mlkit.nl.translate.TranslateLanguage
import com.google.mlkit.nl.translate.TranslateRemoteModel
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.TranslatorOptions

class MLKitTranslationModule(
    reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "MLKitTranslation"

    @ReactMethod
    fun getTranslationPlan(text: String, targetLanguageTag: String, promise: Promise) {
        val languageIdentifier = LanguageIdentification.getClient()

        languageIdentifier.identifyLanguage(text)
            .addOnSuccessListener { languageCode ->
                languageIdentifier.close()

                val sourceLanguage = TranslateLanguage.fromLanguageTag(languageCode)
                val targetLanguage = TranslateLanguage.fromLanguageTag(targetLanguageTag)

                if (languageCode == "und" || sourceLanguage == null || targetLanguage == null) {
                    promise.reject("UNSUPPORTED_LANGUAGE", "지원하지 않는 언어예요.")
                    return@addOnSuccessListener
                }

                if (sourceLanguage == targetLanguage) {
                    promise.resolve(createPlan(languageCode, targetLanguageTag, false, false))
                    return@addOnSuccessListener
                }

                RemoteModelManager.getInstance()
                    .getDownloadedModels(TranslateRemoteModel::class.java)
                    .addOnSuccessListener { models ->
                        val downloadedLanguages = models.map { it.language }.toSet()
                        val requiresDownload = sourceLanguage !in downloadedLanguages ||
                            targetLanguage !in downloadedLanguages

                        promise.resolve(
                            createPlan(languageCode, targetLanguageTag, requiresDownload, true)
                        )
                    }
                    .addOnFailureListener { error ->
                        promise.reject("MODEL_STATUS_FAILED", error.message, error)
                    }
            }
            .addOnFailureListener { error ->
                languageIdentifier.close()
                promise.reject("LANGUAGE_IDENTIFICATION_FAILED", error.message, error)
            }
    }

    @ReactMethod
    fun translate(
        text: String,
        sourceLanguageTag: String,
        targetLanguageTag: String,
        allowModelDownload: Boolean,
        promise: Promise,
    ) {
        val sourceLanguage = TranslateLanguage.fromLanguageTag(sourceLanguageTag)
        val targetLanguage = TranslateLanguage.fromLanguageTag(targetLanguageTag)

        if (sourceLanguage == null || targetLanguage == null) {
            promise.reject("UNSUPPORTED_LANGUAGE", "지원하지 않는 언어예요.")
            return
        }

        val translator = Translation.getClient(
            TranslatorOptions.Builder()
                .setSourceLanguage(sourceLanguage)
                .setTargetLanguage(targetLanguage)
                .build()
        )

        if (!allowModelDownload) {
            translator.close()
            promise.reject("MODEL_DOWNLOAD_REQUIRED", "번역 언어 팩 다운로드가 필요해요.")
            return
        }

        translator.downloadModelIfNeeded(DownloadConditions.Builder().build())
            .addOnSuccessListener {
                translator.translate(text)
                    .addOnSuccessListener { translatedText ->
                        translator.close()
                        val result = Arguments.createMap().apply {
                            putString("sourceLanguage", sourceLanguageTag)
                            putString("targetLanguage", targetLanguageTag)
                            putString("translatedText", translatedText)
                        }
                        promise.resolve(result)
                    }
                    .addOnFailureListener { error ->
                        translator.close()
                        promise.reject("TRANSLATION_FAILED", error.message, error)
                    }
            }
            .addOnFailureListener { error ->
                translator.close()
                promise.reject("MODEL_DOWNLOAD_FAILED", error.message, error)
            }
    }

    private fun createPlan(
        sourceLanguage: String,
        targetLanguage: String,
        requiresDownload: Boolean,
        shouldTranslate: Boolean,
    ) = Arguments.createMap().apply {
        putString("sourceLanguage", sourceLanguage)
        putString("targetLanguage", targetLanguage)
        putBoolean("requiresDownload", requiresDownload)
        putBoolean("shouldTranslate", shouldTranslate)
    }
}
