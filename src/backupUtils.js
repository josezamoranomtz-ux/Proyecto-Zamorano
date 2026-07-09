export const BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_WARNING_DAYS = 7;

export function buildBackupPayload(data, exportedAt = new Date().toISOString()) {
  return {
    app: 'Proyecto Zamorano',
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt,
    data,
    migration: {
      target: 'PostgreSQL or Supabase',
      strategy: 'One table per entity or JSONB storage',
      notes: 'The current JSON structure can be mapped directly to relational tables without changing core application logic.'
    }
  };
}

export function validateBackupPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.app !== 'Proyecto Zamorano') return false;
  if (payload.schemaVersion !== BACKUP_SCHEMA_VERSION) return false;
  if (!payload.data || typeof payload.data !== 'object') return false;
  return true;
}

export function createBackupBlob(data, exportedAt = new Date().toISOString()) {
  const payload = buildBackupPayload(data, exportedAt);
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
}

export function downloadBackupFile(data, fileName = 'proyecto-zamorano-backup.json') {
  const blob = createBackupBlob(data);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function importBackupFromText(text) {
  const parsed = JSON.parse(text);
  if (!validateBackupPayload(parsed)) {
    throw new Error('El archivo de respaldo no tiene el formato esperado.');
  }
  return {
    data: parsed.data,
    exportedAt: parsed.exportedAt,
    migration: parsed.migration
  };
}

export function getBackupWarningState(lastBackupAt, thresholdDays = BACKUP_WARNING_DAYS) {
  if (!lastBackupAt) {
    return { isWarning: true, daysWithoutBackup: null, thresholdDays };
  }
  const diffDays = Math.floor((Date.now() - new Date(lastBackupAt).getTime()) / (1000 * 60 * 60 * 24));
  return {
    isWarning: diffDays >= thresholdDays,
    daysWithoutBackup: diffDays,
    thresholdDays
  };
}
