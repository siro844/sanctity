"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/api/axiosInstance"
import { ThreadComment } from "@/components/thread-comment"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

interface Author {
  username: string
}

interface ThreadCommentData {
  id: number
  body: string
  authorId: number
  parentId: number | null
  deleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  depth: number
  children: ThreadCommentData[]
  author?: Author
}

export default function CommentThreadPage() {
  const params = useParams()
  const router = useRouter()
  const commentId = params.id as string

  const [threadData, setThreadData] = useState<ThreadCommentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const [currentUserId, setCurrentUserId] = useState<number>(5) // Replace with actual user ID from auth

  useEffect(() => {
    if (commentId) {
      fetchThread()
    }
  }, [commentId])

  const fetchThread = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/comment/thread/${commentId}`)
      setThreadData(response.data)
    } catch (err) {
      setError("Failed to load thread")
      console.error("Error fetching thread:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleThreadUpdate = async () => {
    // Add a small delay to ensure the API has processed the new comment
    setTimeout(() => {
      fetchThread()
    }, 500)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
              <div className="ml-8 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchThread} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const totalComments = countTotalComments(threadData)

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to comments
        </Button>
        <span className="text-sm text-gray-500">
          {totalComments} comment{totalComments !== 1 ? "s" : ""} in thread
        </span>
      </div>

      {threadData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Thread not found or has been deleted.</p>
      ) : (
        <div className="space-y-2">
          {threadData.map((comment) => (
            <ThreadComment key={comment.id} comment={comment} onCommentUpdate={handleThreadUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}

function countTotalComments(comments: ThreadCommentData[]): number {
  let count = 0
  for (const comment of comments) {
    count += 1
    count += countTotalComments(comment.children)
  }
  return count
}
