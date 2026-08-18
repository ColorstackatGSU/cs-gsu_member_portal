import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

/**
 * Kept apart from the provider component because Vite fast refresh only works on a module
 * that exports components alone, so a hook beside it costs hot reload for the whole tree.
 */

export type AuthValue = {
  session: Session | null;
  /**
   * True until the first getSession resolves. Distinct from "signed out": treating the
   * unknown state as signed out is what bounces a member to the login page every time
   * they refresh a page.
   */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
