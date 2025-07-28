"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: number;
  username: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers = [
  { id: 1, username: "admin", password: "admin123", role: "admin" as const },
  { id: 2, username: "user", password: "user123", role: "user" as const },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("auth-token");
    const userData = localStorage.getItem("user-data");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-data");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const mockUser = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!mockUser) {
      throw new Error("Invalid credentials");
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const userData = {
      id: mockUser.id,
      username: mockUser.username,
      role: mockUser.role,
    };
    const token = `mock-jwt-token-${mockUser.id}`;

    localStorage.setItem("auth-token", token);
    localStorage.setItem("user-data", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-data");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
