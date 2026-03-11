"use client";

import { useState } from "react";
import Image from "next/image";
import { Post, useLikePost } from "@/hooks/usePosts";
import { useGetComments, useCreateComment, useUpdateComment, useDeleteComment, Comment } from "@/hooks/useComments";
import DeletePostModal from "./DeletePostModal";

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => void;
  onEdit: (post: Post) => void;
}

export default function PostCard({ post, onDelete, onEdit }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  const likeMutation = useLikePost();
  
  const { 
    data: commentData, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    isLoading: isCommentsLoading 
  } = useGetComments(post.id, showComments);

  const createCommentMutation = useCreateComment(post.id);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    return `${Math.floor(minutes / 60)} hours ago`;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    likeMutation.mutate(post.id);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await createCommentMutation.mutateAsync(newComment);
    setNewComment("");
    if (!showComments) setShowComments(true);
  };

  const allComments = commentData?.pages.flatMap(page => page.results) || [];

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-input-border shadow-sm transition-all hover:shadow-md bg-white">
      <header className="flex h-[70px] items-center justify-between bg-primary px-6 text-white shrink-0">
        <h3 className="text-[22px] font-bold truncate pr-4">{post.title}</h3>
        {post.is_owner && (
          <div className="flex items-center gap-6">
            <button onClick={() => onDelete(post.id)} className="cursor-pointer hover:opacity-80 active:scale-90 transition-all">
              <Image src="/icons/ic_baseline-delete-forever.svg" alt="Delete" width={24} height={24} />
            </button>
            <button onClick={() => onEdit(post)} className="cursor-pointer hover:opacity-80 active:scale-90 transition-all">
              <Image src="/icons/ic_bx-edit.svg" alt="Edit" width={24} height={24} />
            </button>
          </div>
        )}
      </header>
      
      <div className="flex flex-col gap-4 p-6">
        <div className="flex justify-between text-lg text-[#777777]">
          <span className="font-bold">@{post.username}</span>
          <span>{timeAgo(post.created_datetime)}</span>
        </div>
        <div className="text-lg leading-tight text-black whitespace-pre-wrap">{post.content}</div>

        <div className="mt-4 flex items-center gap-6 border-t border-gray-100 pt-4">
          <button onClick={handleLike} disabled={likeMutation.isPending}
            className={`group flex items-center gap-1.5 transition-all active:scale-90 ${post.is_liked ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" 
              fill={post.is_liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-200 group-hover:scale-110 ${likeMutation.isPending ? "animate-pulse" : ""}`}>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
            <span className="text-sm font-bold">{post.likes_count}</span>
          </button>

          <button onClick={() => setShowComments(!showComments)}
            className="group flex items-center gap-1.5 text-gray-400 hover:text-primary transition-all active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" 
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:scale-110">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-sm font-bold">{post.comments_count}</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-4 flex flex-col gap-4 border-t border-gray-50 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input type="text" placeholder="Write a comment..." className="flex-1 rounded-full border border-input-border bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={createCommentMutation.isPending} />
              <button type="submit" disabled={!newComment.trim() || createCommentMutation.isPending} className="text-primary font-bold text-sm hover:underline disabled:opacity-50">Post</button>
            </form>

            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {isCommentsLoading ? (
                <div className="flex justify-center py-4"><div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>
              ) : allComments.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-2 italic">No comments yet. Be the first to comment!</p>
              ) : (
                <>
                  {allComments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} postId={post.id} timeAgo={timeAgo} />
                  ))}
                  {hasNextPage && (
                    <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="text-xs text-primary font-bold hover:underline py-2 disabled:opacity-50">
                      {isFetchingNextPage ? "Loading..." : "Load more comments"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {!showComments && post.comments_count > 0 && (
          <button onClick={() => setShowComments(true)} className="text-sm text-[#777777] font-medium hover:underline mt-2 self-start">
            View all {post.comments_count} comments
          </button>
        )}
      </div>
    </article>
  );
}

function CommentItem({ comment, postId, timeAgo }: { comment: Comment; postId: number; timeAgo: (d: string) => string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  const updateMutation = useUpdateComment(postId);
  const deleteMutation = useDeleteComment(postId);

  const handleUpdate = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }
    await updateMutation.mutateAsync({ commentId: comment.id, content: editContent });
    setIsEditing(false);
  };

  const confirmDelete = async () => {
    await deleteMutation.mutateAsync(comment.id);
    setIsDeleteModalOpen(false);
  };

  // Convert explicitly to boolean to avoid truthy/falsy issues
  const isOwner = Boolean(comment.is_owner);

  return (
    <div className="flex flex-col gap-1 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-black">@{comment.username}</span>
          <span className="text-[10px] text-gray-400">{timeAgo(comment.created_datetime)}</span>
        </div>
        
        {isOwner && !isEditing && (
          <div className="flex gap-3 transition-all">
            <button 
              onClick={() => setIsEditing(true)} 
              className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
              title="Edit comment"
            >
              <Image 
                src="/icons/ic_bx-edit-primary.svg" 
                alt="Edit" 
                width={18} 
                height={18} 
              />
            </button>
            <button 
              onClick={() => setIsDeleteModalOpen(true)} 
              className="cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
              title="Delete comment"
            >
              <Image 
                src="/icons/ic_baseline-delete-forever-primary.svg" 
                alt="Delete" 
                width={18} 
                height={18} 
              />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2 mt-1">
          <textarea 
            className="w-full text-sm border border-input-border rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setIsEditing(false); setEditContent(comment.content); }} className="text-xs text-gray-500 font-bold hover:underline">Cancel</button>
            <button onClick={handleUpdate} disabled={updateMutation.isPending} className="text-xs text-primary font-bold hover:underline">
              {updateMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 bg-gray-50 rounded-2xl p-3 inline-block self-start">
          {comment.content}
        </p>
      )}

      {/* Confirmation Modal for Comment Deletion */}
      <DeletePostModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
