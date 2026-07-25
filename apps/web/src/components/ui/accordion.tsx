"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ----- Context -----
interface AccordionContextValue {
  type: "single" | "multiple"
  value: string | string[]
  onValueChange: (value: string | string[]) => void
  collapsible?: boolean
}
const AccordionContext = React.createContext<AccordionContextValue>({
  type: "single",
  value: "",
  onValueChange: () => {},
  collapsible: true,
})

// ----- Root -----
interface AccordionRootProps {
  type?: "single" | "multiple"
  collapsible?: boolean
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  className?: string
  children?: React.ReactNode
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionRootProps>(
  ({ type = "single", collapsible = false, value: controlledValue, defaultValue, onValueChange, className, children }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string | string[]>(
      defaultValue ?? (type === "multiple" ? [] : "")
    )
    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue

    const handleValueChange = (newValue: string | string[]) => {
      if (controlledValue === undefined) setUncontrolledValue(newValue)
      onValueChange?.(newValue)
    }

    return (
      <AccordionContext.Provider value={{ type, value, onValueChange: handleValueChange, collapsible }}>
        <div ref={ref} className={className}>{children}</div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

// ----- Item Context -----
const AccordionItemContext = React.createContext<{ value: string; isOpen: boolean; toggle: () => void }>({
  value: "",
  isOpen: false,
  toggle: () => {},
})

// ----- Item -----
interface AccordionItemProps {
  value: string
  className?: string
  children?: React.ReactNode
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className, children }, ref) => {
    const ctx = React.useContext(AccordionContext)

    const isOpen = ctx.type === "multiple"
      ? (ctx.value as string[]).includes(value)
      : ctx.value === value

    const toggle = () => {
      if (ctx.type === "multiple") {
        const arr = ctx.value as string[]
        ctx.onValueChange(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
      } else {
        ctx.onValueChange(isOpen && ctx.collapsible ? "" : value)
      }
    }

    return (
      <AccordionItemContext.Provider value={{ value, isOpen, toggle }}>
        <div ref={ref} className={cn("border-b border-[#303A3C]/15", className)}>{children}</div>
      </AccordionItemContext.Provider>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

// ----- Trigger -----
interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, toggle } = React.useContext(AccordionItemContext)
    return (
      <div className="flex">
        <button
          ref={ref}
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          className={cn(
            "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
            className
          )}
          {...props}
        >
          {children}
          <ChevronDown
            className="h-4 w-4 shrink-0 transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
      </div>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

// ----- Content -----
interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = React.useContext(AccordionItemContext)
    return (
      <div
        ref={ref}
        className="overflow-hidden text-sm transition-all"
        style={{ maxHeight: isOpen ? "2000px" : "0", transition: "max-height 300ms ease" }}
        {...props}
      >
        <div className={cn("pb-4 pt-0", className)}>{children}</div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
