import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBackupPayload, validateBackupPayload, getBackupWarningState } from './backupUtils.js';

test('buildBackupPayload includes schema metadata and app data', () => {
  const payload = buildBackupPayload({ clients: [{ id: 'c1', name: 'Ana' }] });

  assert.equal(payload.app, 'Proyecto Zamorano');
  assert.equal(payload.schemaVersion, 1);
  assert.equal(payload.data.clients[0].name, 'Ana');
  assert.ok(payload.exportedAt);
});

test('validateBackupPayload rejects invalid backup files', () => {
  assert.equal(validateBackupPayload({}), false);
  assert.equal(validateBackupPayload({ app: 'Proyecto Zamorano', schemaVersion: 1, data: {} }), true);
});

test('getBackupWarningState warns when the backup is too old', () => {
  const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const state = getBackupWarningState(oldDate, 7);
  assert.equal(state.isWarning, true);
  assert.equal(state.daysWithoutBackup >= 7, true);
});
