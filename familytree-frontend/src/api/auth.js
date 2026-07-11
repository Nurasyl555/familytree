import client from './client'

export function register({ username, email, password }) {
  return client.post('/auth/register/', { username, email, password }).then((res) => res.data)
}

export function login({ username, password }) {
  return client.post('/auth/login/', { username, password }).then((res) => res.data)
}
