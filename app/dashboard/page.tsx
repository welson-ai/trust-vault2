"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardStats } from "@/components/dashboard/stats"
import { DashboardTrustScore } from "@/components/dashboard/trust-score"
import { DashboardRecentActivity } from "@/components/dashboard/recent-activity"
import { DashboardQuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader />
      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardRecentActivity />
        </div>
        <div className="space-y-6">
          <DashboardTrustScore />
          <DashboardQuickActions />
        </div>
      </div>
    </div>
  )
}
