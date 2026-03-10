import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// --- Types ---
export interface Post {
  id: number;
  username: string;
  title: string;
  content: string;
  created_datetime: string;
  updated_datetime: string;
  is_owner: boolean; // Added from backend response
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
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/careers/");
      return data;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/v1/careers/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
