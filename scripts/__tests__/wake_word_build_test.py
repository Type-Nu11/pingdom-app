import importlib.util
import io
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location('build_wake_word', Path(__file__).parents[1] / 'build-wake-word-engines.py')
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class WakeWordSourceExtractionTest(unittest.TestCase):
    def build_fixture(self, directory, link_name, link_target):
        archive = directory / 'source.tar.gz'
        with tarfile.open(archive, 'w:gz') as output:
            member = tarfile.TarInfo('upstream/CMakeLists.txt')
            content = b'# fixture native source\n'
            member.size = len(content)
            output.addfile(member, io.BytesIO(content))
            link = tarfile.TarInfo('upstream/' + link_name)
            link.type = tarfile.SYMTYPE
            link.linkname = link_target
            output.addfile(link)
        with patch.object(MODULE, 'CACHE', directory / 'cache'), patch.object(MODULE, 'VENDOR', directory / 'vendor'), \
                patch.object(MODULE, 'fetch', return_value=archive), patch.object(MODULE, 'android') as compile_engine:
            MODULE.build('android')
            compile_engine.assert_called_once_with(directory / 'cache/source')
        return directory / 'cache/source'

    def test_unused_go_example_absolute_link_does_not_block_native_source(self):
        with tempfile.TemporaryDirectory() as folder:
            source = self.build_fixture(Path(folder), 'scripts/go/_internal/example/main.go', '/Users/upstream/example/main.go')
            self.assertEqual((source / 'CMakeLists.txt').read_text(), '# fixture native source\n')
            self.assertFalse((source / 'scripts/go/_internal/example/main.go').is_symlink())

    def test_relative_source_links_are_preserved(self):
        with tempfile.TemporaryDirectory() as folder:
            source = self.build_fixture(Path(folder), 'cmake-link', 'CMakeLists.txt')
            self.assertEqual((source / 'cmake-link').read_text(), '# fixture native source\n')

    def test_absolute_links_outside_go_examples_are_still_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(tarfile.AbsoluteLinkError):
                self.build_fixture(Path(folder), 'native/link', '/tmp/outside-source')


if __name__ == '__main__':
    unittest.main()
