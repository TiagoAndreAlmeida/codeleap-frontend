import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "./api";
import { auth } from "@/lib/firebase";

// Mock do Firebase Auth para não depender do Firebase real nos testes
vi.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

describe("API Interceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reseta o usuário para nulo antes de cada teste
    (auth as any).currentUser = null;
  });

  it("should add Authorization header when user is logged in", async () => {
    // 1. Simular usuário logado com um token fictício
    const mockToken = "fake-jwt-token";
    const getIdTokenMock = vi.fn().mockResolvedValue(mockToken);
    
    (auth as any).currentUser = {
      getIdToken: getIdTokenMock,
    };

    // 2. Acessar o interceptor de requisição registrado na instância do axios
    // O axios armazena os handlers internamente em uma lista
    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;

    // 3. Executar o interceptor com um objeto de configuração simulado
    const config = { headers: {} as any };
    const result = await requestInterceptor(config);

    // 4. Validar se o token foi anexado corretamente no padrão Bearer
    expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    expect(getIdTokenMock).toHaveBeenCalledTimes(1);
  });

  it("should NOT add Authorization header when user is NOT logged in", async () => {
    // 1. Garantir que não há usuário logado
    (auth as any).currentUser = null;

    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;

    // 2. Executar o interceptor
    const config = { headers: {} as any };
    const result = await requestInterceptor(config);

    // 3. Validar que o cabeçalho Authorization não foi criado
    expect(result.headers.Authorization).toBeUndefined();
  });

  it("should maintain existing headers when adding Authorization", async () => {
    // 1. Simular usuário logado
    (auth as any).currentUser = {
      getIdToken: vi.fn().mockResolvedValue("token-abc"),
    };

    const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;

    // 2. Simular config que já possui outros headers (ex: Content-Type)
    const config = { 
      headers: { 
        "X-Custom-Header": "custom-value" 
      } as any 
    };
    
    const result = await requestInterceptor(config);

    // 3. Validar se ambos os headers coexistem
    expect(result.headers["X-Custom-Header"]).toBe("custom-value");
    expect(result.headers.Authorization).toBe("Bearer token-abc");
  });
});
