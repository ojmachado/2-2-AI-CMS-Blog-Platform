
import { User, AuthStep } from '../types';

export const authService = {
  checkEmailStatus: async (email: string): Promise<AuthStep> => {
    // Em modo desenvolvimento local, permitimos login com senha para qualquer email
    return AuthStep.PASSWORD;
  },

  login: async (email: string, password: string): Promise<User> => {
    const mockUser: User = { 
      email: email.toLowerCase(), 
      role: 'admin', 
      createdAt: new Date().toISOString() 
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    return mockUser;
  },

  registerSuperAdmin: async (email: string, password: string): Promise<User> => {
    return authService.login(email, password);
  },

  addUser: async (email: string, role: 'admin' | 'editor'): Promise<void> => {
    console.log("Mock Local: Usuário convidado", email);
  },

  logout: async () => {
    localStorage.removeItem('mock_user');
    window.location.reload();
  },

  getAllUsers: async (): Promise<User[]> => {
    const saved = localStorage.getItem('mock_user');
    return saved ? [JSON.parse(saved)] : [{ email: 'admin@local.com', role: 'admin' }];
  },

  deleteUser: async (emailToDelete: string): Promise<void> => {
    console.log("Mock Local: Removendo acesso", emailToDelete);
  }
};
