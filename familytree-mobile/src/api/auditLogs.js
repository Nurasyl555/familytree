import client from '../services/apiClient';

export const listAuditLogs = (treeId) =>
  client
    .get(`/trees/${treeId}/audit_log/`)
    .then(res => res.data);