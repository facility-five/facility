import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, ...props }, ref) => {
    const commonClassName = cn(
      "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
      "input-text-focus",
      className
    )

    // Para inputs de arquivo, deixamos o navegador controlar o value
    if (type === "file") {
      return (
        <input
          type={type}
          className={commonClassName}
          ref={ref}
          {...props}
        />
      )
    }

    // Demais tipos continuam controlados pelo value
    return (
      <input
        type={type}
        className={commonClassName}
        ref={ref}
        value={value ?? ""}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
