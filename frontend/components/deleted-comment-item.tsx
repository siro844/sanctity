"use client"

import { useState } from "react"
import api from "@/api/axiosInstance"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RotateCcw, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Author {
  username: string
}

interface DeletedComment {
  id: number
  body: string
  authorId: number
  parentId: number | null
  deleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  author: Author
}

interface DeletedCommentItemProps {
  comment: DeletedComment
  onCommentUpdate?: () => void
}

export function DeletedCommentItem({ comment, onCommentUpdate }: DeletedCommentItemProps) {
  const [isRestoring, setIsRestoring] = useState(false)
  const { toast } = useToast()

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const handleRestore = async () => {
    if (!window.confirm("Are you sure you want to restore this comment?")) {
      return
    }

    try {
      setIsRestoring(true)
      await api.post(`/comment/restore/${comment.id}`)
      toast({
        title: "Success",
        description: "Comment restored successfully",
      })
      onCommentUpdate?.()
    } catch (error: any) {
      console.error("Error restoring comment:", error)
      let errorMessage = "Failed to restore comment"

      if (error.response?.status === 403) {
        errorMessage = "You are not authorized to restore this comment"
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsRestoring(false)
    }
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }

  return (
    <Card className="mb-4 bg-red-50 border-red-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs">{getInitials(comment.author.username)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2 flex-wrap">
              <span className="font-medium text-sm">u/{comment.author.username}</span>
              <span className="text-xs text-gray-500">Created {formatTimeAgo(comment.createdAt)}</span>
              {comment.deletedAt && (
                <span className="text-xs text-red-600">Deleted {formatTimeAgo(comment.deletedAt)}</span>
              )}
              <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">deleted</span>
            </div>

            <div className="text-sm text-gray-700 mb-3 p-3 bg-white rounded border border-red-100">{comment.body}</div>

            <div className="flex items-center space-x-4 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestore}
                disabled={isRestoring}
                className="text-xs text-green-600 hover:text-green-900 p-0 h-auto font-normal"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                {isRestoring ? "Restoring..." : "Restore"}
              </Button>

              {comment.parentId ? (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-xs text-gray-600 hover:text-gray-900 p-0 h-auto font-normal"
                >
                  <Link href={`/comments/${comment.parentId}`}>
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View parent thread
                  </Link>
                </Button>
              ) : (
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

              <span className="text-xs text-gray-500">{comment.parentId ? "Reply" : "Top-level comment"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
