
"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  steps: string[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center w-full max-w-xl mx-auto">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isActive = stepNumber === currentStep

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center text-center relative">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 z-10",
                  isCompleted ? "bg-primary border-primary text-primary-foreground" : "",
                  isActive ? "bg-primary border-primary scale-110 text-primary-foreground" : "",
                  !isCompleted && !isActive ? "bg-muted border-border text-muted-foreground" : ""
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{stepNumber}</span>}
              </div>
              <p className={cn(
                  "mt-2 text-xs font-medium transition-colors duration-300 absolute -bottom-6 w-24",
                  isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2 transition-colors duration-300",
                isCompleted ? "bg-primary" : "bg-border"
              )}></div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
