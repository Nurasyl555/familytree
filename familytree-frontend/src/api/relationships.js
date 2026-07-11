import client from './client'

export function createRelationship(treeId, { person_from, person_to, relationship_type }) {
  return client
    .post(`/trees/${treeId}/relationships/`, { person_from, person_to, relationship_type })
    .then((res) => res.data)
}

export function deleteRelationship(treeId, relationshipId) {
  return client.delete(`/trees/${treeId}/relationships/${relationshipId}/`).then((res) => res.data)
}
