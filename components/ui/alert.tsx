import * as React from "react"
import { cn } from "@/lib/utils"

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, variant = "default", ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative w-full rounded-lg border p-4 [&>_:first-child]:mt-0",
          variant === "destructive"
            ? "border-destructive bg-destructive/15 text-destructive"
            : "border-border bg-background",
          className,
        )}
        role="alert"
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} ref={ref}>
        {children}
      </h5>
    )
  },
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn("text-sm opacity-70", className)} {...props} ref={ref}>
        {children}
      </div>
    )
  },
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
