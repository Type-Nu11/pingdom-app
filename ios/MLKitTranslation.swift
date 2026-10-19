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
    let languageIdentifier = LanguageIdentification.languageIdentification()

    languageIdentifier.identifyLanguage(for: text) { languageCode, error in
      if let error {
        reject("LANGUAGE_IDENTIFICATION_FAILED", error.localizedDescription, error)
        return
      }

      guard let languageCode, languageCode != "und",
            let sourceLanguage = Self.translateLanguage(from: languageCode),
            let targetLanguage = Self.translateLanguage(from: targetLanguageTag) else {
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
    guard let sourceLanguage = Self.translateLanguage(from: sourceLanguageTag),
          let targetLanguage = Self.translateLanguage(from: targetLanguageTag) else {
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

  @objc(getOfflineModels:rejecter:)
  func getOfflineModels(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(ModelManager.modelManager().downloadedTranslateModels.map { $0.language.rawValue })
  }

  @objc(downloadOfflineModel:resolver:rejecter:)
  func downloadOfflineModel(_ language: String, resolve: @escaping RCTPromiseResolveBlock,
                            reject: @escaping RCTPromiseRejectBlock) {
    guard let code = Self.translateLanguage(from: language) else {
      reject("UNSUPPORTED_LANGUAGE", "Unsupported language", nil); return
    }
    // Korean -> target translator downloads exactly the missing pair. No text is submitted.
    let translator = Translator.translator(options: TranslatorOptions(sourceLanguage: .english, targetLanguage: code))
    translator.downloadModelIfNeeded(with: ModelDownloadConditions(
      allowsCellularAccess: false, allowsBackgroundDownloading: false
    )) { error in
      if let error { reject("MODEL_DOWNLOAD_FAILED", error.localizedDescription, error) }
      else { resolve(nil) }
      _ = translator // Retain until download completion.
    }
  }

  @objc(deleteOfflineModel:resolver:rejecter:)
  func deleteOfflineModel(_ language: String, resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    guard let code = Self.translateLanguage(from: language), code != .english else {
      reject("UNSUPPORTED_LANGUAGE", "Unsupported model deletion", nil); return
    }
    ModelManager.modelManager().deleteDownloadedModel(TranslateRemoteModel.translateRemoteModel(language: code)) { error in
      if let error { reject("MODEL_DELETE_FAILED", error.localizedDescription, error) }
      else { resolve(nil) }
    }
  }

  @objc(translateOffline:target:resolver:rejecter:)
  func translateOffline(_ text: String, target: String, resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
    guard let code = Self.translateLanguage(from: target), code != .korean else {
      reject("UNSUPPORTED_LANGUAGE", "Unsupported target", nil); return
    }
    let installed = Set(ModelManager.modelManager().downloadedTranslateModels.map(\.language)).union([.english])
    guard installed.contains(.korean), installed.contains(code) else {
      reject("MODEL_DOWNLOAD_REQUIRED", "Download models first", nil); return
    }
    let translator = Translator.translator(options: TranslatorOptions(sourceLanguage: .korean, targetLanguage: code))
    translator.translate(text) { result, error in
      if let error { reject("TRANSLATION_FAILED", error.localizedDescription, error) }
      else if let result { resolve(result) }
      else { reject("TRANSLATION_FAILED", "Empty result", nil) }
      _ = translator
    }
  }

  private static func translateLanguage(from languageTag: String) -> TranslateLanguage? {
    let language = TranslateLanguage(rawValue: languageTag)

    return TranslateLanguage.allLanguages().contains(language) ? language : nil
  }
}
