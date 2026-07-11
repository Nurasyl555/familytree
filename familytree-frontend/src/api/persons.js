import client from './client'

function toRequestBody(data) {
  const hasFile = data.photo instanceof File
  if (!hasFile) {
    const { photo: _photo, ...rest } = data
    return rest
  }

  const form = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (key === 'extra_data') {
      form.append(key, JSON.stringify(value))
    } else {
      form.append(key, value)
    }
  })
  return form
}

export function createPerson(treeId, data) {
  const body = toRequestBody(data)
  return client.post(`/trees/${treeId}/persons/`, body).then((res) => res.data)
}

export function updatePerson(treeId, personId, data) {
  const body = toRequestBody(data)
  return client.patch(`/trees/${treeId}/persons/${personId}/`, body).then((res) => res.data)
}

export function deletePerson(treeId, personId) {
  return client.delete(`/trees/${treeId}/persons/${personId}/`).then((res) => res.data)
}
