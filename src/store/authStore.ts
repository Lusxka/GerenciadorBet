import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  getAllUsers: () => User[];
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

// Initial mock users for demonstration
const initialMockUsers = [
  {
    id: '1',
    email: 'admin@sistema.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'cliente@sistema.com',
    password: 'cliente123',
    name: 'Cliente Teste',
    role: 'client' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      users: initialMockUsers,

      login: async (email: string, password: string) => {
        try {
          const { users } = get();
          const user = users.find(u => u.email === email && u.password === password);
          
          if (user) {
            const { password: _, ...userWithoutPassword } = user;
            const mockToken = `token_${user.id}_${Date.now()}`;
            
            set({
              user: userWithoutPassword,
              token: mockToken,
              isAuthenticated: true,
            });
            
            return { success: true, message: 'Login realizado com sucesso!' };
          }
          
          return { success: false, message: 'Email ou senha incorretos' };
        } catch (error) {
          console.error('Erro no login:', error);
          return { success: false, message: 'Erro interno do servidor' };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      register: async (name: string, email: string, password: string) => {
        try {
          const { users } = get();
          
          // Validations
          if (!name.trim()) {
            return { success: false, message: 'Nome é obrigatório' };
          }
          
          if (!email.trim()) {
            return { success: false, message: 'Email é obrigatório' };
          }
          
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { success: false, message: 'Email inválido' };
          }
          
          if (password.length < 6) {
            return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
          }

          // Check if email already exists
          const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (existingUser) {
            return { success: false, message: 'Este email já está em uso' };
          }

          // Create new user
          const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: email.toLowerCase(),
            password,
            name: name.trim(),
            role: 'client' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const updatedUsers = [...users, newUser];
          
          // Auto-login after registration
          const { password: _, ...userWithoutPassword } = newUser;
          const mockToken = `token_${newUser.id}_${Date.now()}`;
          
          set({
            users: updatedUsers,
            user: userWithoutPassword,
            token: mockToken,
            isAuthenticated: true,
          });

          return { success: true, message: 'Conta criada com sucesso!' };
        } catch (error) {
          console.error('Erro no registro:', error);
          return { success: false, message: 'Erro interno do servidor' };
        }
      },

      getAllUsers: () => {
        const { users } = get();
        return users.map(({ password, ...user }) => user as User);
      },

      updateUser: (id: string, updates: Partial<User>) => {
        set((state) => ({
          users: state.users.map(user => 
            user.id === id 
              ? { ...user, ...updates, updatedAt: new Date() }
              : user
          ),
        }));
      },

      deleteUser: (id: string) => {
        set((state) => ({
          users: state.users.filter(user => user.id !== id),
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
      }),
    }
  )
);