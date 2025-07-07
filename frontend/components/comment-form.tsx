"use client";

import type React from "react";

import { useState } from "react";
import api from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface CommentFormProps {
  parentId?: number | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  buttonText?: string;
  isReply?: boolean;
}

export function CommentForm({
  parentId = null,
  onSuccess,
  onCancel,
  placeholder = "What are your thoughts?",
  buttonText = "Comment",
  isReply = false,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/comment/create", {
        body: body.trim(),
        parentId,
      });
      toast.success(
        isReply ? "Reply posted successfully!" : "Comment posted successfully!",
        {
          description: (
        <span className="text-black">
          {isReply ? "Your reply has been added." : "Your comment has been added."}
        </span>
          ),
        }
      );

      setBody("");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Error", {
        description: (
          <span className="text-red-500">
        Failed to post comment. Please try again.
          </span>
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={isReply ? "ml-8 mt-2" : "mb-6"}>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || !body.trim()}>
              {isSubmitting ? "Posting..." : buttonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
