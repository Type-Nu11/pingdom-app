#!/usr/bin/env python3
"""Build the pinned Apache sherpa engine without TTS/eSpeak dependencies."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import plistlib
import shutil
import subprocess
import tarfile
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent / 'native/wake-word'
LOCK = json.loads((ROOT / 'artifacts.lock.json').read_text())
CACHE = Path(os.environ.get('PINGDOM_KWS_CACHE', Path.home() / '.cache/pingdom-wake-word/1.13.8'))
VENDOR = ROOT / 'vendor'


def digest(path):
    with path.open('rb') as file:
        return hashlib.file_digest(file, 'sha256').hexdigest()


def fetch(key):
    item = LOCK[key]
    path = CACHE / item['filename']
    if not path.exists() or digest(path) != item['sha256']:
        path.parent.mkdir(parents=True, exist_ok=True)
        request = urllib.request.Request(item['url'], headers={'User-Agent': 'Pingdom-KWS-Build'})
        with urllib.request.urlopen(request, timeout=60) as source, path.open('wb') as output:
            shutil.copyfileobj(source, output)
    if digest(path) != item['sha256']:
        raise ValueError(f'Pinned artifact hash mismatch: {key}')
    return path


def unzip(key):
    directory = CACHE / key
    if not directory.exists():
        with zipfile.ZipFile(fetch(key)) as archive:
            for item in archive.infolist():
                name = Path(item.filename)
                if name.is_absolute() or '..' in name.parts:
                    raise ValueError('Unsafe archive member')
            archive.extractall(directory)
    return directory


def run(args, env=None):
    subprocess.run([str(value) for value in args], check=True, env=env)


def configure(source, build, flags, env=None):
    common = ['-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_POLICY_VERSION_MINIMUM=3.5',
              '-DSHERPA_ONNX_ENABLE_TTS=OFF', '-DSHERPA_ONNX_ENABLE_SPEAKER_DIARIZATION=OFF',
              '-DSHERPA_ONNX_ENABLE_PORTAUDIO=OFF', '-DSHERPA_ONNX_ENABLE_WEBSOCKET=OFF',
              '-DSHERPA_ONNX_ENABLE_PYTHON=OFF', '-DSHERPA_ONNX_ENABLE_TESTS=OFF',
              '-DSHERPA_ONNX_ENABLE_CHECK=OFF', '-DSHERPA_ONNX_ENABLE_BINARY=OFF',
              '-DSHERPA_ONNX_BUILD_C_API_EXAMPLES=OFF']
    run(['cmake', '-S', source, '-B', build, f'-DCMAKE_INSTALL_PREFIX={build}/install', *common, *flags], env)
    run(['cmake', '--build', build, '--parallel', os.environ.get('PINGDOM_KWS_JOBS', '3')], env)
    run(['cmake', '--install', build], env)


def stamp(platform, paths):
    files = {str(path.relative_to(VENDOR)): digest(path) for path in paths}
    (VENDOR / f'{platform}-build.json').write_text(json.dumps({
        'sourceSha256': LOCK['source']['sha256'], 'variant': 'kws-no-tts',
        'version': '1.13.8', 'tts': False, 'speakerDiarization': False, 'files': files,
    }, indent=2) + '\n')


def android(source):
    sdk = Path(os.environ.get('ANDROID_HOME', Path.home() / 'Library/Android/sdk'))
    ndk = Path(os.environ.get('ANDROID_NDK_HOME', sdk / 'ndk/27.1.12297006'))
    if not (ndk / 'build/cmake/android.toolchain.cmake').exists():
        raise ValueError('Install Android NDK 27.1.12297006 or set ANDROID_NDK_HOME')
    # CMake verifies the upstream ORT digest before extracting the local archive.
    shutil.copyfile(fetch('onnxAndroid'), source / LOCK['onnxAndroid']['filename'])
    build = CACHE / 'build-android-arm64'
    configure(source, build, [f'-DCMAKE_TOOLCHAIN_FILE={ndk}/build/cmake/android.toolchain.cmake',
        '-DANDROID_ABI=arm64-v8a', '-DANDROID_PLATFORM=android-24', '-DANDROID_STL=c++_shared',
        '-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON', '-DBUILD_SHARED_LIBS=ON',
        '-DCMAKE_SHARED_LINKER_FLAGS=-Wl,-z,max-page-size=16384',
        '-DSHERPA_ONNX_ENABLE_JNI=ON', '-DSHERPA_ONNX_ENABLE_C_API=OFF'])
    output = VENDOR / 'sherpa-onnx-kws-1.13.8.aar'
    with zipfile.ZipFile(fetch('androidWrapper')) as wrapper, zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as aar:
        # Only Apache-licensed Java/Kotlin wrappers; never copy upstream native/TTS binaries.
        for name in ['classes.jar', 'AndroidManifest.xml', 'R.txt', 'proguard.txt']:
            aar.writestr(name, wrapper.read(name))
        for library in sorted((build / 'install/lib').glob('*.so')):
            if library.name != 'libc++_shared.so':
                aar.write(library, 'jni/arm64-v8a/' + library.name)
    stamp('android', [output])


def ios(source, repackage=False):
    ort = unzip('onnxIOS') / 'onnxruntime.xcframework'
    framework_args = []
    for platform, slice_name, variant in [('OS64', 'ios-arm64', None), ('SIMULATORARM64', 'ios-arm64_x86_64-simulator', 'simulator')]:
        build = CACHE / ('build-ios-' + platform)
        env = dict(os.environ, SHERPA_ONNXRUNTIME_LIB_DIR=str(ort / slice_name),
                   SHERPA_ONNXRUNTIME_INCLUDE_DIR=str(ort / slice_name / 'onnxruntime.framework/Headers'))
        if not repackage:
            configure(source, build, [f'-DCMAKE_TOOLCHAIN_FILE={source}/toolchains/ios.toolchain.cmake',
                f'-DPLATFORM={platform}', '-DDEPLOYMENT_TARGET=15.5', '-DENABLE_BITCODE=OFF',
                '-DENABLE_ARC=ON', '-DENABLE_VISIBILITY=OFF', '-DBUILD_SHARED_LIBS=OFF',
                '-DSHERPA_ONNX_ENABLE_JNI=OFF', '-DSHERPA_ONNX_ENABLE_C_API=ON'], env)
        framework = build / 'SherpaOnnxC.framework'
        (framework / 'Headers/sherpa-onnx/c-api').mkdir(parents=True, exist_ok=True)
        (framework / 'Modules').mkdir(exist_ok=True)
        shutil.copy2(source / 'sherpa-onnx/c-api/c-api.h', framework / 'Headers/sherpa-onnx/c-api/c-api.h')
        libraries = sorted((build / 'install/lib').glob('*.a'))
        libraries += [ort / slice_name / 'onnxruntime.framework/onnxruntime']
        run(['xcrun', 'libtool', '-static', '-arch_only', 'arm64', '-o', framework / 'SherpaOnnxC', *libraries])
        (framework / 'Modules/module.modulemap').write_text('framework module SherpaOnnxC {\n  header "sherpa-onnx/c-api/c-api.h"\n  export *\n}\n')
        info = {'CFBundleExecutable': 'SherpaOnnxC', 'CFBundleIdentifier': 'com.pingdom.sherpa-onnx.kws',
                'CFBundleName': 'SherpaOnnxC', 'CFBundlePackageType': 'FMWK',
                'CFBundleShortVersionString': '1.13.8', 'CFBundleVersion': '1',
                'MinimumOSVersion': '15.5', 'CFBundleSupportedPlatforms': ['iPhoneSimulator' if variant else 'iPhoneOS']}
        (framework / 'Info.plist').write_bytes(plistlib.dumps(info))
        framework_args += ['-framework', str(framework)]
    output = VENDOR / 'SherpaOnnxC.xcframework'
    if output.exists():
        shutil.rmtree(output)
    run(['xcodebuild', '-create-xcframework', *framework_args, '-output', output])
    stamp('ios', [path for path in sorted(output.rglob('*')) if path.is_file()])


def source_archive_filter(member, destination):
    # The pinned upstream archive contains developer-local links in Go examples.
    # They are not native build inputs; retain data_filter for every other entry.
    if (member.issym() and Path(member.name).parts[1:4] == ('scripts', 'go', '_internal')
            and Path(member.linkname).is_absolute()):
        return None
    return tarfile.data_filter(member, destination)


def build(platform):
    CACHE.mkdir(parents=True, exist_ok=True)
    VENDOR.mkdir(parents=True, exist_ok=True)
    source = CACHE / 'source'
    if not (source / 'CMakeLists.txt').is_file():
        extracted = CACHE / 'source-unpack'
        with tarfile.open(fetch('source')) as archive:
            archive.extractall(extracted, filter=source_archive_filter)
        shutil.move(next(extracted.iterdir()), source)
    for target in (['android', 'ios'] if platform == 'all' else [platform]):
        (android if target == 'android' else ios)(source)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--platform', choices=['android', 'ios', 'all'], default='all')
    parser.add_argument('--repackage-ios', action='store_true')
    arguments = parser.parse_args()
    if arguments.repackage_ios:
        ios(CACHE / 'source', repackage=True)
    else:
        build(arguments.platform)
