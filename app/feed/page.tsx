"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/feed/PostCard";
import CreatePostTrigger from "@/components/feed/CreatePostTrigger";
import CreatePostModal from "@/components/feed/CreatePostModal";
import DeletePostModal from "@/components/feed/DeletePostModal";
import EditPostModal from "@/components/feed/EditPostModal";

interface Post {
  id: number;
  username: string;
  title: string;
  content: string;
  created_datetime: string;
}

export default function FeedPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem("codeleap_username");
    if (!savedUsername) {
      router.push("/");
      return;
    }
    setUsername(savedUsername);

    setPosts([
      {
        id: 1,
        username: "Victor",
        title: "My First Post at CodeLeap Network!",
        content: "Curabitur suscipit suscipit tellus. Phasellus consectetuer vestibulum elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
        created_datetime: new Date(Date.now() - 25 * 60000).toISOString(),
      }
    ]);
    setLoading(false);
  }, [router]);

  const handleCreatePost = (title: string, content: string) => {
    const newPost: Post = {
      id: Date.now(),
      username,
      title,
      content,
      created_datetime: new Date().toISOString(),
    };
    setPosts([newPost, ...posts]);
  };

  const openDeleteModal = (id: number) => {
    setPostIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (postIdToDelete !== null) {
      setPosts(posts.filter(p => p.id !== postIdToDelete));
      setIsDeleteModalOpen(false);
      setPostIdToDelete(null);
    }
  };

  const openEditModal = (post: Post) => {
    setPostToEdit(post);
    setIsEditModalOpen(true);
  };

  const confirmEdit = (title: string, content: string) => {
    if (postToEdit) {
      setPosts(posts.map(p => p.id === postToEdit.id ? { ...p, title, content } : p));
      setIsEditModalOpen(false);
      setPostToEdit(null);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center pb-10">
      <header className="fixed top-0 z-10 flex h-20 w-full max-w-[800px] items-center bg-primary px-8">
        <h1 className="text-[22px] font-bold text-white">CodeLeap Network</h1>
      </header>

      <main className="mt-20 flex w-full max-w-[800px] flex-col gap-6 bg-white p-6 min-h-[calc(100vh-80px)] shadow-sm">
        {/* Novo Gatilho Estilo Rede Social */}
        <CreatePostTrigger 
          username={username} 
          onClick={() => setIsCreateModalOpen(true)} 
        />
        
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={username} 
              onDelete={openDeleteModal}
              onEdit={openEditModal}
            />
          ))}
        </div>
      </main>

      {/* Modais de Gerenciamento de Postagens */}
      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handleCreatePost}
      />

      <DeletePostModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      <EditPostModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={confirmEdit}
        initialTitle={postToEdit?.title || ""}
        initialContent={postToEdit?.content || ""}
      />
    </div>
  );
}
