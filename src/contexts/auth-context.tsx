import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { User } from "@/types";
import { users } from "@/lib/mock-data";

interface AuthContextValue {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  conversationLastReadAt: Record<string, string>;
  markConversationRead: (conversationId: string, readAt?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(users[0]);
  const [conversationLastReadAt, setConversationLastReadAt] = useState<Record<string, string>>({});

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
    // Read markers are user-specific, so reset when switching profiles.
    setConversationLastReadAt({});
  }, []);

  const markConversationRead = useCallback((conversationId: string, readAt?: string) => {
    const effectiveReadAt = readAt ?? new Date().toISOString();
    setConversationLastReadAt((prev) => ({
      ...prev,
      [conversationId]: effectiveReadAt,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers: users,
        conversationLastReadAt,
        markConversationRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
