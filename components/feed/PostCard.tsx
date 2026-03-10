"use client";

import Image from "next/image";

interface Post {
  id: number;
  username: string;
  title: string;
  content: string;
  created_datetime: string;
}

interface PostCardProps {
  post: Post;
  currentUser: string;
  onDelete: (id: number) => void;
  onEdit: (post: Post) => void;
}

export default function PostCard({ post, currentUser, onDelete, onEdit }: PostCardProps) {
  const isOwner = post.username === currentUser;

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    return `${Math.floor(minutes / 60)} hours ago`;
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-input-border shadow-sm transition-all hover:shadow-md">
      <header className="flex h-[70px] items-center justify-between bg-primary px-6 text-white">
        <h3 className="text-[22px] font-bold truncate pr-4">{post.title}</h3>
        {isOwner && (
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onDelete(post.id)}
              className="cursor-pointer hover:opacity-80 active:scale-90 transition-all"
              aria-label="Delete post"
            >
              <Image 
                src="/icons/ic_baseline-delete-forever.svg" 
                alt="Delete" 
                width={24} 
                height={24}
              />
            </button>
            <button 
              onClick={() => onEdit(post)}
              className="cursor-pointer hover:opacity-80 active:scale-90 transition-all"
              aria-label="Edit post"
            >
              <Image 
                src="/icons/ic_bx-edit.svg" 
                alt="Edit" 
                width={24} 
                height={24}
              />
            </button>
          </div>
        )}
      </header>
      <div className="flex flex-col gap-4 p-6 bg-white">
        <div className="flex justify-between text-lg text-[#777777]">
          <span className="font-bold">@{post.username}</span>
          <span>{timeAgo(post.created_datetime)}</span>
        </div>
        <div className="text-lg leading-tight text-black whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
    </article>
  );
}
