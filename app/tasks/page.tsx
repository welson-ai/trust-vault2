"use client"

import { TasksHeader } from "@/components/tasks/header"
import { TasksFilters } from "@/components/tasks/filters"
import { TasksList } from "@/components/tasks/list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TasksPage() {
  const router = useRouter()
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>
      <TasksHeader />
      <TasksFilters />
      <TasksList />
    </div>
  )
}
