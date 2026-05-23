export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'admin';
}

const defaultUsers: User[] = [
  {
    id: '1',
    email: 'admin@techstore.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'customer@example.com',
    password: 'customer123',
    name: 'John Customer',
    role: 'customer',
  },
  {
    id: '3',
    email: 'jane@example.com',
    password: 'jane123',
    name: 'Jane Doe',
    role: 'customer',
  },
];

// 🔥 Inicializa usuarios SIN quedarse pegado a datos viejos
function initializeMockUsers(): User[] {
  if (typeof window === 'undefined') {
    return [...defaultUsers];
  }

  const stored = localStorage.getItem('allUsers');

  // Si existe y es válido → usarlo
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing allUsers, resetting...', error);
    }
  }

  // 🔥 Si no existe → guardar defaults
  localStorage.setItem('allUsers', JSON.stringify(defaultUsers));

  return [...defaultUsers];
}

// Base de datos fake en memoria
export let mockUsers: User[] = initializeMockUsers();

// Obtener usuarios actuales
export function getMockUsers() {
  return mockUsers;
}

// Actualizar usuarios en memoria + localStorage
export function updateMockUsers(users: User[]) {
  mockUsers = users;

  if (typeof window !== 'undefined') {
    localStorage.setItem('allUsers', JSON.stringify(users));
  }
}

// 🔥 FUNCIÓN OPCIONAL (MUY ÚTIL EN DESARROLLO)
// resetea todo cuando quieras
export function resetMockUsers() {
  mockUsers = [...defaultUsers];

  if (typeof window !== 'undefined') {
    localStorage.removeItem('allUsers');
    localStorage.setItem('allUsers', JSON.stringify(defaultUsers));
  }
}