
// Mock completo para remover dependência do Firebase Backend
// O sistema agora roda 100% local (LocalStorage) ou via APIs REST diretas (Gemini/Resend)

export const auth: any = {
  currentUser: null,
  onAuthStateChanged: (cb: any) => () => {},
  signInWithEmailAndPassword: async () => ({ user: { email: 'mock@local.com' } }),
  signOut: async () => {}
};

export const db: any = {};
export const storage: any = {};

export const getFirebaseConfigStatus = () => ({
  isValid: true,
  missingKeys: []
});
