import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedPosts } from "./usePosts";

// --- Types ---
export interface Comment {
  id: number;
  username: string;
  content: string;
  is_owner: boolean;
  created_datetime: string;
  updated_datetime: string;
}

export interface PaginatedComments {
  count: number;
  next: string | null;
  previous: string | null;
  results: Comment[];
}

// --- Hooks ---

export function useGetComments(postId: number, enabled: boolean = false) {
  return useInfiniteQuery<PaginatedComments>({
    queryKey: ["comments", postId],
    queryFn: async ({ pageParam = `/api/v1/careers/${postId}/comments/` }) => {
      const { data } = await api.get(pageParam as string);
      return data;
    },
    initialPageParam: `/api/v1/careers/${postId}/comments/`,
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        return url.pathname + url.search;
      }
      return undefined;
    },
    enabled,
  });
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post(`/api/v1/careers/${postId}/comments/`, { content });
      return data as Comment;
    },
    onSuccess: (newComment: Comment) => {
      queryClient.setQueryData<InfiniteData<PaginatedComments>>(["comments", postId], (oldData) => {
        if (!oldData) return oldData;
        const newPages = [...oldData.pages];
        newPages[0] = {
          ...newPages[0],
          results: [newComment, ...newPages[0].results],
          count: (newPages[0].count || 0) + 1,
        };
        return { ...oldData, pages: newPages };
      });

      queryClient.setQueryData<InfiniteData<PaginatedPosts>>(["posts"], (oldPosts) => {
        if (!oldPosts) return oldPosts;
        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => ({
            ...page,
            results: page.results.map((post) => 
              post.id === postId ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post
            ),
          })),
        };
      });
    },
  });
}

/**
 * Updates a specific comment.
 */
export function useUpdateComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      const { data } = await api.patch(`/api/v1/comments/${commentId}/`, { content });
      return data as Comment;
    },
    onSuccess: (updatedComment: Comment) => {
      queryClient.setQueryData<InfiniteData<PaginatedComments>>(["comments", postId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((c) => (c.id === updatedComment.id ? updatedComment : c)),
          })),
        };
      });
    },
  });
}

/**
 * Deletes a specific comment and decrements the post count.
 */
export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: number) => {
      await api.delete(`/api/v1/comments/${commentId}/`);
      return commentId;
    },
    onSuccess: (deletedId: number) => {
      // 1. Remove from comments list
      queryClient.setQueryData<InfiniteData<PaginatedComments>>(["comments", postId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.filter((c) => c.id !== deletedId),
            count: (page.count || 0) - 1,
          })),
        };
      });

      // 2. Decrement comments_count in main feed
      queryClient.setQueryData<InfiniteData<PaginatedPosts>>(["posts"], (oldPosts) => {
        if (!oldPosts) return oldPosts;
        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => ({
            ...page,
            results: page.results.map((post) => 
              post.id === postId ? { ...post, comments_count: Math.max(0, post.comments_count - 1) } : post
            ),
          })),
        };
      });
    },
  });
}
