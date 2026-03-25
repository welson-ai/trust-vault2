"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function TasksHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Contracts & Tasks</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">Manage your active and completed contracts</p>
      </div>
      <Link href="/contracts/create">
        <Button size="sm" className="rounded-full gap-2 text-xs">
          <Plus className="w-3 h-3" />
          New Contract
        </Button>
      </Link>
    </div>
  )
}
