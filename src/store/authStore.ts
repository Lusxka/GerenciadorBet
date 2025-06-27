import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

// Simulação de usuários para demonstração
const mockUsers = [
  {
    id: '1',
    email: 'admin@sistema.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'cliente@sistema.com',
    password: 'cliente123',
    name: 'Cliente Teste',
    role: 'client' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          // Simulação de autenticação
          const user = mockUsers.find(u => u.email === email && u.password === password);
          
          if (user) {
            const { password: _, ...userWithoutPassword } = user;
            const mockToken = `token_${user.id}_${Date.now()}`;
            
            set({
              user: userWithoutPassword,
              token: mockToken,
              isAuthenticated: true,
            });
            
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Erro no login:', error);
          return false;
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
          // Verificar se o email já existe
          const existingUser = mockUsers.find(u => u.email === email);
          if (existingUser) {
            return false;
          }

          // Criar novo usuário
          const newUser = {
            id: `user_${Date.now()}`,
            email,
            password,
            name,
            role: 'client' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          mockUsers.push(newUser);
          
          // Auto-login após registro
          const { password: _, ...userWithoutPassword } = newUser;
          const mockToken = `token_${newUser.id}_${Date.now()}`;
          
          set({
            user: userWithoutPassword,
            token: mockToken,
            isAuthenticated: true,
          });

          return true;
        } catch (error) {
          console.error('Erro no registro:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);