"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reply, Trash2 } from "lucide-react";
import { CommentForm } from "./comment-form";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/axiosInstance";
import { toast } from "sonner";

interface Author {
  username: string;
}

interface ThreadCommentData {
  id: number;
  body: string;
  authorId: number;
  parentId: number | null;
  deleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  depth: number;
  children: ThreadCommentData[];
  author?: Author;
  username?: string;
}

interface ThreadCommentProps {
  comment: ThreadCommentData;
  onCommentUpdate?: () => void;
}

export function ThreadComment({
  comment,
  onCommentUpdate,
}: ThreadCommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getIndentationStyle = (depth: number) => {
    const maxDepth = 8; // Limit maximum indentation
    const actualDepth = Math.min(depth, maxDepth);
    return {
      marginLeft: `${actualDepth * 24}px`,
      borderLeft: depth > 0 ? "2px solid #e5e7eb" : "none",
      paddingLeft: depth > 0 ? "16px" : "0",
    };
  };

  const getDepthColor = (depth: number) => {
    const colors = [
      "border-l-blue-200",
      "border-l-green-200",
      "border-l-yellow-200",
      "border-l-purple-200",
      "border-l-pink-200",
      "border-l-indigo-200",
      "border-l-red-200",
      "border-l-gray-200",
    ];
    return depth > 0 ? colors[depth % colors.length] : "";
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onCommentUpdate?.();
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/comment/${comment.id}`);
      toast.success("Success", {
        description: "Comment deleted successfully",
      });
      onCommentUpdate?.();
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      let errorMessage = "Failed to delete comment";

      if (error.response?.status === 403) {
        errorMessage = "You are not authorized to delete this comment";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mb-2">
      <div
        style={getIndentationStyle(comment.depth)}
        className={`${comment.depth > 0 ? getDepthColor(comment.depth) : ""}`}
      >
        <Card
          className={`${comment.depth === 0 ? "border-2 border-blue-200" : ""}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs">
                  {comment.author ? getInitials(comment.author.username) : "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2 flex-wrap">
                  <span className="font-medium text-sm">
                    u/{comment.username || "Unknown"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                  {comment.depth > 0 && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      depth {comment.depth}
                    </span>
                  )}
                  {comment.deleted && (
                    <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                      deleted
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-900 mb-3">
                  {comment.deleted ? (
                    <span className="italic text-gray-500">[deleted]</span>
                  ) : (
                    comment.body
                  )}
                </div>

                <div className="flex items-center space-x-4 flex-wrap mb-2">
                  {!comment.deleted && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="text-xs text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-xs text-red-600 hover:text-red-900 p-0 h-auto font-normal"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </>
                  )}
                </div>

                {comment.children.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {comment.children.length} repl
                    {comment.children.length === 1 ? "y" : "ies"}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reply Form */}
        {showReplyForm && (
          <div
            style={{ marginLeft: `${Math.min(comment.depth + 1, 8) * 24}px` }}
          >
            <CommentForm
              parentId={comment.id}
              onSuccess={handleReplySuccess}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Write a reply..."
              buttonText="Reply"
              isReply={true}
            />
          </div>
        )}
      </div>

      {/* Render children recursively */}
      {comment.children.map((child) => (
        <ThreadComment
          key={child.id}
          comment={child}
          onCommentUpdate={onCommentUpdate}
        />
      ))}
    </div>
  );
}
