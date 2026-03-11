import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGetComments, useCreateComment, useDeleteComment, useUpdateComment } from "./useComments";
import { useGetPosts } from "./usePosts";
import api from "@/lib/api";
import React from "react";

// 1. Mock do cliente API
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

// 2. Setup do QueryClient estável
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
  },
});

let testQueryClient: QueryClient;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={testQueryClient}>
    {children}
  </QueryClientProvider>
);

describe("useComments Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testQueryClient = createTestQueryClient();
  });

  it("should fetch comments for a specific post", async () => {
    const postId = 123;
    const mockComments = {
      count: 1,
      next: null,
      results: [{ id: 1, content: "Nice post!", username: "user1" }],
    };

    (api.get as any).mockResolvedValue({ data: mockComments });

    const { result } = renderHook(() => useGetComments(postId, true), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages[0].results).toHaveLength(1);
    expect(result.current.data?.pages[0].results[0].content).toBe("Nice post!");
  });

  it("should update post comments_count when a new comment is created", async () => {
    const postId = 555;
    
    // 1. Setup: Popular o cache de POSTS e de COMMENTS
    const initialPosts = {
      count: 1,
      results: [{ id: postId, title: "Target Post", comments_count: 0, username: "dev" }]
    };
    const initialComments = { count: 0, results: [] };

    // Mocks de rede
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("comments")) return Promise.resolve({ data: initialComments });
      return Promise.resolve({ data: initialPosts });
    });

    const { result } = renderHook(() => ({
      getPosts: useGetPosts(),
      getComments: useGetComments(postId, true),
      createComment: useCreateComment(postId)
    }), { wrapper });

    await waitFor(() => expect(result.current.getPosts.isSuccess).toBe(true));

    // 2. Ação: Criar comentário
    const newComment = { id: 1, content: "First!", username: "tester" };
    (api.post as any).mockResolvedValue({ data: newComment });

    await result.current.createComment.mutateAsync("First!");

    // 3. Validação: Verificar se AMBOS os caches atualizaram
    await waitFor(() => {
      // Comentário adicionado na lista de comentários
      expect(result.current.getComments.data?.pages[0].results).toHaveLength(1);
      
      // Contador incrementado na lista de posts
      const updatedPost = result.current.getPosts.data?.pages[0].results.find(p => p.id === postId);
      expect(updatedPost?.comments_count).toBe(1);
    });
  });

  it("should decrement post comments_count when a comment is deleted", async () => {
    const postId = 777;
    const commentId = 10;

    // 1. Setup: Post com 1 comentário e Lista com 1 comentário
    const initialPosts = {
      count: 1,
      results: [{ id: postId, title: "Post", comments_count: 1, username: "dev" }]
    };
    const initialComments = { 
      count: 1, 
      results: [{ id: commentId, content: "Bye!", username: "user" }] 
    };

    (api.get as any).mockImplementation((url: string) => {
      if (url.includes("comments")) return Promise.resolve({ data: initialComments });
      return Promise.resolve({ data: initialPosts });
    });

    const { result } = renderHook(() => ({
      getPosts: useGetPosts(),
      getComments: useGetComments(postId, true),
      deleteComment: useDeleteComment(postId)
    }), { wrapper });

    await waitFor(() => expect(result.current.getComments.isSuccess).toBe(true));

    // 2. Ação: Deletar
    (api.delete as any).mockResolvedValue({});
    await result.current.deleteComment.mutateAsync(commentId);

    // 3. Validação
    await waitFor(() => {
      // Removido da lista
      expect(result.current.getComments.data?.pages[0].results).toHaveLength(0);
      
      // Contador decrementado
      const updatedPost = result.current.getPosts.data?.pages[0].results.find(p => p.id === postId);
      expect(updatedPost?.comments_count).toBe(0);
    });
  });
});
