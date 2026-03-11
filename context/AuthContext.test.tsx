import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import React from "react";

// 1. Mocks das funções do Firebase
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

// 2. Mock do objeto auth que exportamos da lib/firebase
vi.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
  },
  googleProvider: {},
}));

// Componente auxiliar para consumir o Hook useAuth
const TestComponent = () => {
  const { user, logout } = useAuth();
  
  // Nota: O AuthProvider atual só renderiza children quando loading é false.
  return (
    <div>
      <div data-testid="user-email">{user?.email || "no-user"}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it("should show user data after authentication is resolved", async () => {
    // Simular o Firebase retornando um usuário logado
    const mockUser = { 
      email: "test@codeleap.com", 
      uid: "123",
      getIdToken: vi.fn().mockResolvedValue("fake-token")
    } as unknown as User;

    (onAuthStateChanged as Mock).mockImplementation((_auth, callback) => {
      callback(mockUser);
      return () => {}; 
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Esperar pelo render do filho (que só ocorre quando loading = false)
    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("test@codeleap.com");
    });
  });

  it("should show 'no-user' when user is not logged in", async () => {
    (onAuthStateChanged as Mock).mockImplementation((_auth, callback) => {
      callback(null);
      return () => {};
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("no-user");
    });
  });

  it("should call Firebase signOut when logout function is executed", async () => {
    const mockUser = { 
      email: "test@codeleap.com", 
      uid: "123",
      getIdToken: vi.fn().mockResolvedValue("fake-token")
    } as unknown as User;

    (onAuthStateChanged as Mock).mockImplementation((_auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Esperar o usuário carregar antes de clicar em Logout
    const emailDisplay = await screen.findByTestId("user-email");
    expect(emailDisplay).toBeInTheDocument();

    const logoutButton = screen.getByText("Logout");
    
    await act(async () => {
      logoutButton.click();
    });

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
