import Foundation
import MLKitLanguageID
import MLKitTranslate
import React

@objc(MLKitTranslation)
final class MLKitTranslation: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc(getTranslationPlan:targetLanguage:resolver:rejecter:)
  func getTranslationPlan(
    _ text: String,
    targetLanguageTag: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let languageIdentifier = NaturalLanguage.languageIdentification()

    languageIdentifier.identifyLanguage(for: text) { languageCode, error in
      if let error {
        reject("LANGUAGE_IDENTIFICATION_FAILED", error.localizedDescription, error)
        return
      }

      guard let languageCode, languageCode != "und",
            let sourceLanguage = TranslateLanguage.fromLanguageTag(languageCode),
            let targetLanguage = TranslateLanguage.fromLanguageTag(targetLanguageTag) else {
        reject("UNSUPPORTED_LANGUAGE", "지원하지 않는 언어예요.", nil)
        return
      }

      guard sourceLanguage != targetLanguage else {
        resolve([
          "sourceLanguage": languageCode,
          "targetLanguage": targetLanguageTag,
          "requiresDownload": false,
          "shouldTranslate": false,
        ])
        return
      }

      let downloadedLanguages = Set(
        ModelManager.modelManager().downloadedTranslateModels.map(\.language)
      )
      let requiresDownload = !downloadedLanguages.contains(sourceLanguage) ||
        !downloadedLanguages.contains(targetLanguage)

      resolve([
        "sourceLanguage": languageCode,
        "targetLanguage": targetLanguageTag,
        "requiresDownload": requiresDownload,
        "shouldTranslate": true,
      ])
    }
  }

  @objc(translate:sourceLanguage:targetLanguage:allowModelDownload:resolver:rejecter:)
  func translate(
    _ text: String,
    sourceLanguageTag: String,
    targetLanguageTag: String,
    allowModelDownload: Bool,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let sourceLanguage = TranslateLanguage.fromLanguageTag(sourceLanguageTag),
          let targetLanguage = TranslateLanguage.fromLanguageTag(targetLanguageTag) else {
      reject("UNSUPPORTED_LANGUAGE", "지원하지 않는 언어예요.", nil)
      return
    }

    guard allowModelDownload else {
      reject("MODEL_DOWNLOAD_REQUIRED", "번역 언어 팩 다운로드가 필요해요.", nil)
      return
    }

    let translator = Translator.translator(
      options: TranslatorOptions(sourceLanguage: sourceLanguage, targetLanguage: targetLanguage)
    )
    let translateText = {
      translator.translate(text) { translatedText, error in
        if let error {
          reject("TRANSLATION_FAILED", error.localizedDescription, error)
          return
        }

        guard let translatedText else {
          reject("TRANSLATION_FAILED", "번역 결과를 가져오지 못했어요.", nil)
          return
        }

        resolve([
          "sourceLanguage": sourceLanguageTag,
          "targetLanguage": targetLanguageTag,
          "translatedText": translatedText,
        ])
      }
    }

    translator.downloadModelIfNeeded(
      with: ModelDownloadConditions(
        allowsCellularAccess: true,
        allowsBackgroundDownloading: false
      )
    ) { error in
      if let error {
        reject("MODEL_DOWNLOAD_FAILED", error.localizedDescription, error)
        return
      }

      translateText()
    }
  }
}
