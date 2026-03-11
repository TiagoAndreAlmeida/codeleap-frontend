"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGetPosts, useCreatePost, useUpdatePost, useDeletePost, Post } from "@/hooks/usePosts";
import PostCard from "@/components/feed/PostCard";
import CreatePostTrigger from "@/components/feed/CreatePostTrigger";
import CreatePostModal from "@/components/feed/CreatePostModal";
import DeletePostModal from "@/components/feed/DeletePostModal";
import EditPostModal from "@/components/feed/EditPostModal";

export default function FeedPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const observerRef = useRef<HTMLDivElement>(null);
  
  // Infinite Query Hook
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading: isPostsLoading, 
    isError 
  } = useGetPosts();
  
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flattening data from pages
  const allPosts = data?.pages.flatMap((page) => page.results) || [];

  const handleCreatePost = async (title: string, content: string) => {
    await createPostMutation.mutateAsync({ title, content });
    setIsCreateModalOpen(false);
  };

  const confirmDelete = async () => {
    if (postIdToDelete !== null) {
      await deletePostMutation.mutateAsync(postIdToDelete);
      setIsDeleteModalOpen(false);
      setPostIdToDelete(null);
    }
  };

  const confirmEdit = async (title: string, content: string) => {
    if (postToEdit) {
      await updatePostMutation.mutateAsync({ id: postToEdit.id, title, content });
      setIsEditModalOpen(false);
      setPostToEdit(null);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center pb-10">
      <header className="fixed top-0 z-10 flex h-20 w-full max-w-[800px] items-center justify-between bg-primary px-8 shadow-md">
        <h1 className="text-[22px] font-bold text-white">CodeLeap Network</h1>
        <button 
          onClick={logout}
          className="text-white hover:underline font-bold text-sm cursor-pointer"
        >
          Logout
        </button>
      </header>

      <main className="mt-20 flex w-full max-w-[800px] flex-col gap-6 bg-white p-6 min-h-[calc(100vh-80px)] shadow-sm">
        <CreatePostTrigger 
          username={user.displayName || user.email?.split('@')[0] || "user"} 
          onClick={() => setIsCreateModalOpen(true)} 
        />
        
        {isPostsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold">Loading initial posts...</p>
          </div>
        ) : isError ? (
          <div className="flex justify-center py-10 text-red-500 font-bold">Error loading posts. Please try again.</div>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              {allPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onDelete={(id) => { setPostIdToDelete(id); setIsDeleteModalOpen(true); }}
                  onEdit={(p) => { setPostToEdit(p); setIsEditModalOpen(true); }}
                />
              ))}
            </div>

            {/* Invisible observer element for Infinite Scroll */}
            <div ref={observerRef} className="py-10 flex flex-col justify-center items-center gap-2">
              {isFetchingNextPage && (
                <>
                  <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-gray-500 text-sm font-medium">Loading more...</span>
                </>
              )}
              {!hasNextPage && allPosts.length > 0 && (
                <div className="text-gray-400 text-sm italic border-t border-gray-100 w-full pt-4 text-center">
                  You reached the end of the feed.
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handleCreatePost}
        isLoading={createPostMutation.isPending}
      />

      <DeletePostModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={deletePostMutation.isPending}
      />

      <EditPostModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={confirmEdit}
        initialTitle={postToEdit?.title || ""}
        initialContent={postToEdit?.content || ""}
        isLoading={updatePostMutation.isPending}
      />
    </div>
  );
}
