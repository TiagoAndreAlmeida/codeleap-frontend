import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { useGetPosts, useCreatePost, useDeletePost } from "./usePosts";
import api from "@/lib/api";
import React from "react";

// 1. Mock do cliente API (Axios instance)
vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const mockApi = api as unknown as {
  get: Mock;
  post: Mock;
  patch: Mock;
  delete: Mock;
};

// 2. Setup do QueryClient estável por teste
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { 
      retry: false,
      staleTime: Infinity // Evita refetchs automáticos durante o teste
    },
  },
});

let testQueryClient: QueryClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={testQueryClient}>
    {children}
  </QueryClientProvider>
);

describe("usePosts Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testQueryClient = createTestQueryClient();
  });

  describe("useGetPosts", () => {
    it("should fetch posts successfully in infinite scroll format", async () => {
      const mockPostsData = {
        count: 1,
        next: null,
        previous: null,
        results: [
          { id: 1, username: "tiago", title: "Hello", content: "World", created_datetime: new Date().toISOString() }
        ],
      };

      mockApi.get.mockResolvedValue({ data: mockPostsData });

      const { result } = renderHook(() => useGetPosts(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0].results).toHaveLength(1);
      expect(result.current.data?.pages[0].results[0].title).toBe("Hello");
    });
  });

  describe("useCreatePost", () => {
    it("should add a new post to the cache after successful creation", async () => {
      // 1. Setup: Primeiro populamos o cache com um post existente
      const initialData = {
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 1, title: "Old Post", content: "...", username: "user" }],
      };
      mockApi.get.mockResolvedValue({ data: initialData });

      const { result } = renderHook(() => ({
        get: useGetPosts(),
        create: useCreatePost()
      }), { wrapper });

      // Esperar carregar os posts iniciais
      await waitFor(() => expect(result.current.get.isSuccess).toBe(true));

      // 2. Ação: Criar um novo post
      const newPost = { id: 2, title: "New Post", content: "New Content", username: "tiago" };
      mockApi.post.mockResolvedValue({ data: newPost });

      // Executa a mutação
      await result.current.create.mutateAsync({ title: "New Post", content: "New Content" });

      // 3. Validação: Aguardar o cache ser atualizado pelo onSuccess
      await waitFor(() => {
        const posts = result.current.get.data?.pages[0].results;
        expect(posts).toHaveLength(2);
        expect(posts?.[0].title).toBe("New Post");
      });
    });
  });

  describe("useDeletePost", () => {
    it("should remove the post from the cache after deletion", async () => {
      // 1. Setup: Populamos o cache com um post que será deletado
      const initialData = {
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 99, title: "To be deleted", content: "...", username: "user" }],
      };
      mockApi.get.mockResolvedValue({ data: initialData });

      const { result } = renderHook(() => ({
        get: useGetPosts(),
        delete: useDeletePost()
      }), { wrapper });

      await waitFor(() => expect(result.current.get.isSuccess).toBe(true));
      expect(result.current.get.data?.pages[0].results).toHaveLength(1);

      // 2. Ação: Deletar o post
      mockApi.delete.mockResolvedValue({});
      
      await result.current.delete.mutateAsync(99);

      // 3. Validação: Aguardar a remoção do cache
      await waitFor(() => {
        expect(result.current.get.data?.pages[0].results).toHaveLength(0);
      });
    });
  });
});
