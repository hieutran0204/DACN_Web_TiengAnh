"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  id: string
  icon: LucideIcon
  title: string
  description: string
  color: string
}

export default function FeatureCard({ id, icon: Icon, title, description, color }: FeatureCardProps) {
  return (
    <Card className="bg-white border border-border hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className={`${color} p-6 rounded-t-lg flex items-center justify-center h-24`}>
        <Icon className="w-12 h-12 text-primary" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 flex-1">{description}</p>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full bg-transparent"
        >
          Explore
        </Button>
      </div>
    </Card>
  )
}
