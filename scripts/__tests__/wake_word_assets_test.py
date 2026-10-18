import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location('prepare_wake_word', Path(__file__).parents[1] / 'prepare-wake-word.py')
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class WakeWordAssetsTest(unittest.TestCase):
    def fixture(self, root, keywords=None):
        if keywords is None:
            keywords = ('HH EY1 P IH1 NG D IY0 @Hey_Pingdy\n'
                        'h ēi p íng d í @Hey_Pingdy\n'
                        'h ēi p ìn d ì @Hey_Pingdy\n')
        assets = root / 'assets/pingdom-wake-word'
        assets.mkdir(parents=True)
        (assets / 'encoder.onnx').write_bytes(b'fixture model')
        (assets / 'keywords.txt').write_text(keywords)
        (assets / 'tokens.txt').write_text('HH 1\nEY1 2\nP 3\nIH1 4\nNG 5\nD 6\nIY0 7\nh 8\nēi 9\np 10\níng 11\nd 12\ní 13\nìn 14\nì 15\n')
        manifest = {'modelId': 'sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20', 'engineVersion': '1.13.8',
                    'phrase': 'Hey Pingdy', 'keyword': 'Hey_Pingdy', 'files': {
            p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in assets.iterdir()}}
        (assets / 'manifest.json').write_text(json.dumps(manifest))
        for name in ['LICENSE-APACHE-2.0.txt', 'NOTICE.txt', 'LICENSE-ONNX-RUNTIME.txt', 'THIRD-PARTY-NOTICES-ONNX-RUNTIME.txt']:
            (assets / name).write_text('fixture notice')
        return assets

    def test_real_committed_model_and_full_phrase_are_valid(self):
        MODULE.verify_model(Path(__file__).parents[2] / 'native/wake-word')

    def test_modified_model_fails_before_build(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            assets = self.fixture(root)
            (assets / 'encoder.onnx').write_bytes(b'tampered')
            with self.assertRaisesRegex(ValueError, 'integrity'):
                MODULE.verify_model(root)

    def test_full_phrase_korean_acoustic_variants_are_accepted(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.fixture(root)
            MODULE.verify_model(root)

    def test_partial_phrase_is_rejected_even_with_matching_hash(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.fixture(root, 'P IH1 NG D IY0 @Hey_Pingdy\n')
            with self.assertRaisesRegex(ValueError, 'Partial'):
                MODULE.verify_model(root)

    def test_missing_notice_fails_build_verification(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            assets = self.fixture(root)
            (assets / 'NOTICE.txt').unlink()
            with self.assertRaisesRegex(ValueError, 'Missing packaged notice'):
                MODULE.verify_model(root)


if __name__ == '__main__':
    unittest.main()
