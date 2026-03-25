"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

const filters = ["All", "Active", "Pending", "Completed", "Disputed"]

export function TasksFilters() {
  const [active, setActive] = useState("All")

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <Button
          key={filter}
          variant={active === filter ? "default" : "outline"}
          size="sm"
          className="rounded-full whitespace-nowrap"
          onClick={() => setActive(filter)}
        >
          {filter}
        </Button>
      ))}
    </div>
  )
}
