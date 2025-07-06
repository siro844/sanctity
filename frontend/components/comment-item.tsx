"use client";

import { useState } from "react";
import api from "@/api/axiosInstance";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ExternalLink,
  Reply,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { CommentForm } from "./comment-form";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

interface Author {
  username: string;
}

interface Comment {
  id: number;
  body: string;
  authorId: number;
  parentId: number | null;
  deleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: Author;
}

interface RepliesResponse {
  data: Comment[];
  nextCursor: string | null;
}

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  onCommentUpdate?: () => void;
}

export function CommentItem({
  comment,
  isReply = false,
  onCommentUpdate,
}: CommentItemProps) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  //   const { toast } = useToast()

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

  const fetchReplies = async () => {
    if (repliesLoaded) {
      setShowReplies(!showReplies);
      return;
    }

    try {
      setLoadingReplies(true);
      const response = await api.get(`/comment/replies/${comment.id}`);
      const repliesData: RepliesResponse = response.data;
      setReplies(repliesData.data);
      setRepliesLoaded(true);
      setShowReplies(true);
    } catch (err) {
      console.error("Error fetching replies:", err);
      toast("Error", {
        description: "Failed to load replies",
      });
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    if (repliesLoaded) {
      fetchReplies(); // Refresh replies
    }
    onCommentUpdate?.();
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete(`/comment/${comment.id}`);
    toast("Success", {
      description: <span className="text-black">Comment deleted successfully</span>,
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
        description: <span className="text-red-500">{errorMessage}</span>,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`${isReply ? "ml-8 border-l-2 border-gray-200 pl-4" : ""}`}>
      <Card className="mb-2">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">
                {getInitials(comment.author.username)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-sm">
                  u/{comment.author.username}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(comment.createdAt)}
                </span>
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

              <div className="flex items-center space-x-4 flex-wrap">
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

                    {!isReply && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchReplies}
                        disabled={loadingReplies}
                        className="text-xs text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {loadingReplies ? (
                          "Loading..."
                        ) : repliesLoaded ? (
                          <>
                            {showReplies ? (
                              <>
                                <ChevronUp className="w-3 h-3 ml-1" />
                                Hide replies
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 ml-1" />
                                View replies ({replies.length})
                              </>
                            )}
                          </>
                        ) : (
                          "View replies"
                        )}
                      </Button>
                    )}

                    {!isReply && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-xs text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
                      >
                        <Link href={`/comments/${comment.id}`}>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View thread
                        </Link>
                      </Button>
                    )}

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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {showReplyForm && (
        <CommentForm
          parentId={comment.id}
          onSuccess={handleReplySuccess}
          onCancel={() => setShowReplyForm(false)}
          placeholder="Write a reply..."
          buttonText="Reply"
          isReply={true}
        />
      )}

      {/* Loading skeleton for replies */}
      {loadingReplies && (
        <div className="ml-8 space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply={true}
              onCommentUpdate={onCommentUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
