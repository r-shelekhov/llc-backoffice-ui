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
  const [conversationLastReadAt, setConversationLastReadAt] = useState<Record<string, string>>({
    // Pre-seed read timestamps for "no action required" conversations
    // so they don't trigger the "unread" action reason.
    "conv-1": "2026-01-14T11:00:00Z",
    "conv-4": "2026-01-10T15:00:00Z",
    "conv-8": "2026-01-20T12:00:00Z",
    "conv-9": "2026-01-16T10:00:00Z",
    "conv-12": "2026-02-10T10:00:00Z",
    "conv-13": "2026-01-20T11:00:00Z",
    "conv-15": "2026-02-22T04:00:00Z",
    "conv-19": "2026-02-03T10:00:00Z",
    "conv-21": "2026-02-18T08:00:00Z",
    "conv-25": "2026-02-20T16:00:00Z",
    "conv-26": "2026-02-25T11:00:00Z",
    "conv-27": "2026-02-16T19:00:00Z",
    "conv-28": "2026-02-24T16:00:00Z",
  });

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
