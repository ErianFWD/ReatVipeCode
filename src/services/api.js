const API_URL = 'http://localhost:3001';

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('No se pudo conectar con el servidor. Verifica que JSON Server esté ejecutándose en el puerto 3001.');
    }
    throw error;
  }
}

export async function loginUser(email, password) {
  const users = await request(`/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
  return users[0] || null;
}

export function getUsers() {
  return request('/users');
}

export function createUser(user) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export function updateUser(id, data) {
  return request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteUser(id) {
  return request(`/users/${id}`, { method: 'DELETE' });
}

export function getReservations() {
  return request('/reservations?_sort=date,time&_order=asc,asc');
}

export function getUserReservations(ownerId) {
  return request(`/reservations?ownerId=${ownerId}&_sort=date,time&_order=asc,asc`);
}

export function createReservation(reservation) {
  return request('/reservations', {
    method: 'POST',
    body: JSON.stringify(reservation),
  });
}

export function updateReservation(id, data) {
  return request(`/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getReservationById(id) {
  return request(`/reservations/${id}`);
}

export { API_URL };
