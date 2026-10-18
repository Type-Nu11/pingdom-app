#!/usr/bin/env python3
"""Fetch pinned native engines, verify committed model assets, and fail closed.

The app never downloads wake-word models at runtime. --check is network-free.
"""
import argparse
import hashlib
import json
from pathlib import Path

FULL_PHRASE_KEYWORDS = [
    'HH EY1 P IH1 NG D IY0 @Hey_Pingdy',
    'h ēi p íng d í @Hey_Pingdy',
    'h ēi p ìn d ì @Hey_Pingdy',
]

def sha256(path):
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()


def verify_model(root):
    assets = root / 'assets/pingdom-wake-word'
    manifest = json.loads((assets / 'manifest.json').read_text())
    if (manifest.get('modelId') != 'sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20'
            or manifest.get('engineVersion') != '1.13.8'):
        raise ValueError('Unexpected wake-word model or engine version')
    if manifest['phrase'] != 'Hey Pingdy' or manifest['keyword'] != 'Hey_Pingdy':
        raise ValueError('The complete Hey Pingdy keyword must be registered')
    for name, digest in manifest['files'].items():
        if Path(name).name != name or sha256(assets / name) != digest:
            raise ValueError(f'Model integrity failure: {name}')
    keywords = (assets / 'keywords.txt').read_text().splitlines()
    if keywords != FULL_PHRASE_KEYWORDS:
        raise ValueError('Partial wake-word registration is not allowed')
    tokens = {line.rsplit(' ', 1)[0] for line in (assets / 'tokens.txt').read_text().splitlines()}
    if not {token for keyword in keywords for token in keyword.split()[:-1]} <= tokens:
        raise ValueError('A pronunciation token is absent from the selected model')
    for notice in ['LICENSE-APACHE-2.0.txt', 'NOTICE.txt', 'LICENSE-ONNX-RUNTIME.txt', 'THIRD-PARTY-NOTICES-ONNX-RUNTIME.txt']:
        if not (assets / notice).is_file():
            raise ValueError(f'Missing packaged notice: {notice}')


def prepare(root, platform, check=False):
    verify_model(root)
    lock = json.loads((root / 'artifacts.lock.json').read_text())
    vendor = root / 'vendor'
    for target in (['android', 'ios'] if platform == 'all' else [platform]):
        stamp = vendor / f'{target}-build.json'
        valid = False
        if stamp.is_file():
            build = json.loads(stamp.read_text())
            valid = (build.get('sourceSha256') == lock['source']['sha256']
                     and build.get('version') == lock['version']
                     and build.get('variant') == 'kws-no-tts' and build.get('tts') is False
                     and bool(build.get('files')))
            for name, digest in build.get('files', {}).items():
                path = Path(name)
                valid = valid and not path.is_absolute() and '..' not in path.parts
                valid = valid and (vendor / name).is_file() and sha256(vendor / name) == digest
        if valid:
            continue
        if check:
            raise ValueError(f'{target} KWS-only engine missing or modified. Run npm run prepare:wake-word')
        import subprocess
        import sys
        subprocess.run([sys.executable, str(Path(__file__).with_name('build-wake-word-engines.py')),
                        '--platform', target], check=True)
        prepare(root, target, check=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--platform', choices=['all', 'android', 'ios'], default='all')
    parser.add_argument('--check', action='store_true')
    arguments = parser.parse_args()
    prepare(Path(__file__).resolve().parent.parent / 'native/wake-word', arguments.platform, arguments.check)
    print('Wake-word model, complete keyword, notices and native engine checks passed.')
