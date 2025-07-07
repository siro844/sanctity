"use client"

import { useEffect, useState } from "react"
import api from "@/api/axiosInstance"
import { DeletedCommentItem } from "@/components/deleted-comment-item"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

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

export default function DeletedCommentsPage() {
  const [deletedComments, setDeletedComments] = useState<DeletedComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDeletedComments()
  }, [])

  const fetchDeletedComments = async () => {
    try {
      setLoading(true)
      const response = await api.get("/comment/deleted")
      setDeletedComments(response.data)
    } catch (err) {
      setError("Failed to load deleted comments")
      console.error("Error fetching deleted comments:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Trash2 className="w-6 h-6 mr-2 text-red-500" />
            Deleted Comments
          </h1>
          <Button variant="outline" asChild>
            <Link href="/comments">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Comments
            </Link>
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDeletedComments} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Trash2 className="w-6 h-6 mr-2 text-red-500" />
          Deleted Comments ({deletedComments.length})
        </h1>
        <Button variant="outline" asChild>
          <Link href="/comments">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Comments
          </Link>
        </Button>
      </div>

      {deletedComments.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">No deleted comments found</p>
          <p className="text-gray-400 text-sm">Your deleted comments will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deletedComments.map((comment) => (
            <DeletedCommentItem key={comment.id} comment={comment} onCommentUpdate={fetchDeletedComments} />
          ))}
        </div>
      )}
    </div>
  )
}
