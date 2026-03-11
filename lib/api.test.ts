import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import api from "./api";
import { auth } from "@/lib/firebase";
import { InternalAxiosRequestConfig } from "axios";

// Interface para tipar o acesso interno aos interceptores do Axios nos testes
interface AxiosInterceptorHandler {
  fulfilled: (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> | InternalAxiosRequestConfig;
  rejected: (error: unknown) => Promise<unknown>;
}

// Mock do Firebase Auth para não depender do Firebase real nos testes
vi.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

const mockAuth = auth as unknown as {
  currentUser: {
    getIdToken: Mock;
  } | null;
};

describe("API Interceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reseta o usuário para nulo antes de cada teste
    mockAuth.currentUser = null;
  });

  it("should add Authorization header when user is logged in", async () => {
    // 1. Simular usuário logado com um token fictício
    const mockToken = "fake-jwt-token";
    const getIdTokenMock = vi.fn().mockResolvedValue(mockToken);
    
    mockAuth.currentUser = {
      getIdToken: getIdTokenMock,
    };

    // 2. Acessar o interceptor de requisição tipado
    const handlers = (api.interceptors.request as unknown as { handlers: AxiosInterceptorHandler[] }).handlers;
    const requestInterceptor = handlers[0].fulfilled;

    // 3. Executar o interceptor com um objeto de configuração simulado
    const config = { headers: {} } as unknown as InternalAxiosRequestConfig;
    const result = await requestInterceptor(config);

    // 4. Validar se o token foi anexado corretamente no padrão Bearer
    expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    expect(getIdTokenMock).toHaveBeenCalledTimes(1);
  });

  it("should NOT add Authorization header when user is NOT logged in", async () => {
    // 1. Garantir que não há usuário logado
    mockAuth.currentUser = null;

    const handlers = (api.interceptors.request as unknown as { handlers: AxiosInterceptorHandler[] }).handlers;
    const requestInterceptor = handlers[0].fulfilled;

    // 2. Executar o interceptor
    const config = { headers: {} } as unknown as InternalAxiosRequestConfig;
    const result = await requestInterceptor(config);

    // 3. Validar que o cabeçalho Authorization não foi criado
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("should maintain existing headers when adding Authorization", async () => {
    // 1. Simular usuário logado
    const getIdTokenMock = vi.fn().mockResolvedValue("token-abc");
    mockAuth.currentUser = {
      getIdToken: getIdTokenMock,
    };

    const handlers = (api.interceptors.request as unknown as { handlers: AxiosInterceptorHandler[] }).handlers;
    const requestInterceptor = handlers[0].fulfilled;

    // 2. Simular config que já possui outros headers
    const config = { 
      headers: { 
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        has: vi.fn(),
        "X-Custom-Header": "custom-value" 
      }
    } as unknown as InternalAxiosRequestConfig;
    
    const result = await requestInterceptor(config);

    // 3. Validar se ambos os headers coexistem
    expect(result.headers["X-Custom-Header"]).toBe("custom-value");
    expect(result.headers.Authorization).toBe("Bearer token-abc");
  });
});
