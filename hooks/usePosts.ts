import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import api from "@/lib/api";

// --- Types ---
export interface Post {
  id: number;
  username: string;
  title: string;
  content: string;
  created_datetime: string;
  updated_datetime: string;
  is_owner: boolean;
  is_liked: boolean;
  likes_count: number;
  comments_count: number; // Added for comments functionality
}

export interface PaginatedPosts {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
}

export interface CreatePostData {
  title: string;
  content: string;
}

export interface UpdatePostData {
  id: number;
  title: string;
  content: string;
}

// --- Hooks ---

export function useGetPosts() {
  return useInfiniteQuery<PaginatedPosts>({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = "/api/v1/careers/" }) => {
      const { data } = await api.get(pageParam as string);
      return data;
    },
    initialPageParam: "/api/v1/careers/",
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        return url.pathname + url.search;
      }
      return undefined;
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPost: CreatePostData) => {
      const { data } = await api.post("/api/v1/careers/", newPost);
      return data;
    },
    onSuccess: (newlyCreatedPost: Post) => {
      queryClient.setQueryData<InfiniteData<PaginatedPosts>>(["posts"], (oldData) => {
        if (!oldData) return oldData;
        const newPages = [...oldData.pages];
        newPages[0] = {
          ...newPages[0],
          results: [newlyCreatedPost, ...newPages[0].results],
          count: (newPages[0].count || 0) + 1,
        };
        return { ...oldData, pages: newPages };
      });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updatedData }: UpdatePostData) => {
      const { data } = await api.patch(`/api/v1/careers/${id}/`, updatedData);
      return data;
    },
    onSuccess: (updatedPost: Post) => {
      queryClient.setQueryData<InfiniteData<PaginatedPosts>>(["posts"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
          })),
        };
      });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/v1/careers/${id}/`);
      return id;
    },
    onSuccess: (deletedId: number) => {
      queryClient.setQueryData<InfiniteData<PaginatedPosts>>(["posts"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.filter((p) => p.id !== deletedId),
            count: (page.count || 0) - 1,
          })),
        };
      });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: number) => {
      const { data } = await api.post(`/api/v1/careers/${postId}/like/`, {});
      return { postId, ...data };
    },
    onSuccess: (response) => {
      queryClient.setQueryData<InfiniteData<PaginatedPosts>>(["posts"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            results: page.results.map((p) => 
              p.id === response.postId 
                ? { ...p, is_liked: response.liked, likes_count: response.likes_count } 
                : p
            ),
          })),
        };
      });
    },
  });
}
