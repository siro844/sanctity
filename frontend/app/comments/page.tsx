"use client"

import { useEffect, useState } from "react"
import api from "@/api/axiosInstance"
import { CommentItem } from "@/components/comment-item"
import { Skeleton } from "@/components/ui/skeleton"
import { CommentForm } from "@/components/comment-form"

interface Author {
  username: string
}

interface Comment {
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

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const [currentUserId, setCurrentUserId] = useState<number>(5) // Replace with actual user ID from auth

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await api.get("/comment/all")
      setComments(response.data)
    } catch (err) {
      setError("Failed to load comments")
      console.error("Error fetching comments:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Comments</h1>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchComments} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Comments ({comments.length})</h1>
      <CommentForm onSuccess={fetchComments} />
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No comments yet.</p>
        ) : (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} onCommentUpdate={fetchComments} />)
        )}
      </div>
    </div>
  )
}
