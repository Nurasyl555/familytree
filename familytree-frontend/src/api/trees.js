import client from './client'

export function listTrees() {
  return client.get('/trees/').then((res) => res.data)
}

export function createTree({ name, privacy }) {
  return client.post('/trees/', { name, privacy }).then((res) => res.data)
}

export function deleteTree(treeId) {
  return client.delete(`/trees/${treeId}/`).then((res) => res.data)
}

export function fullTree(treeId) {
  return client.get(`/trees/${treeId}/full_tree/`).then((res) => res.data)
}

export function generateInvite(treeId, { role, email }) {
  return client.post(`/trees/${treeId}/generate_invite/`, { role, email }).then((res) => res.data)
}

export function acceptInvite(token) {
  return client.post('/trees/accept_invite/', { token }).then((res) => res.data)
}
