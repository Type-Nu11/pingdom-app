import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectDesignSource } from '../check-v2-design.mjs';
const source = 'src/v2/modules/example/Screen.tsx';
for (const control of ['Alert', 'ActionSheetIOS', 'ToastAndroid', 'DatePickerAndroid', 'TimePickerAndroid']) {
  test(`reject native ${control}, including aliases and namespace access`, () => {
    assert.equal(inspectDesignSource(source, `import { ${control} as Native } from 'react-native';`).length, 1);
    assert.equal(inspectDesignSource(source, `import * as RN from 'react-native'; RN.${control};`).length, 1);
    assert.equal(inspectDesignSource(source, `import RN from 'react-native'; RN.${control};`).length, 1);
  });
}
test('new raw Modal hosts must use the common styled modal', () => {
  assert.equal(inspectDesignSource(source, "import { Modal as Popup } from 'react-native';").length, 1);
  assert.deepEqual(inspectDesignSource('src/v2/shared/components/AppModal.tsx', "import { Modal } from 'react-native';"), []);
  assert.deepEqual(inspectDesignSource(source, "import AppModal from './AppModal'; <AppModal />;"), []);
});
test('sheet chrome and clipping cannot be assembled separately by a consumer', () => {
  assert.equal(inspectDesignSource(source, "import * as Glass from './sheet'; <Glass.SheetInner />").length, 1);
  assert.equal(inspectDesignSource(source, "import { SheetContentViewport as V } from './sheet'; <V />;").length, 1);
  assert.deepEqual(inspectDesignSource(source, '<MapSheetSurface><List /></MapSheetSurface>'), []);
  assert.deepEqual(inspectDesignSource('src/v2/modules/place/map/sheet/components/MapSheetSurface.tsx', '<Styles.SheetInner />'), []);
});
test('type-only imports do not render a platform control', () => {
  assert.deepEqual(inspectDesignSource(source, "import type { Alert } from 'react-native';"), []);
});
