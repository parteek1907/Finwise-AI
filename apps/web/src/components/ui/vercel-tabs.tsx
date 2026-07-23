"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, tabs, activeTab, onTabChange, ...props }, ref) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [hoverStyle, setHoverStyle] = useState({})
    const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
    const tabRefs = useRef<(HTMLDivElement | null)[]>([])

    // Update activeIndex if activeTab prop is provided
    useEffect(() => {
      if (activeTab) {
        const index = tabs.findIndex(t => t.id === activeTab);
        if (index !== -1) setActiveIndex(index);
      }
    }, [activeTab, tabs]);

    useEffect(() => {
      if (hoveredIndex !== null) {
        const hoveredElement = tabRefs.current[hoveredIndex]
        if (hoveredElement) {
          const { offsetLeft, offsetWidth } = hoveredElement
          setHoverStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          })
        }
      }
    }, [hoveredIndex])

    useEffect(() => {
      const activeElement = tabRefs.current[activeIndex]
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    }, [activeIndex])

    useEffect(() => {
      requestAnimationFrame(() => {
        const firstElement = tabRefs.current[activeIndex]
        if (firstElement) {
          const { offsetLeft, offsetWidth } = firstElement
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          })
        }
      })
    }, [activeIndex])

    return (
      <div 
        ref={ref} 
        className={className}
        style={{ position: 'relative' }}
        {...props}
      >
        <div style={{ position: 'relative' }}>
          {/* Hover Highlight */}
          <div
            style={{
              position: 'absolute',
              height: '30px',
              transition: 'all 300ms ease-out',
              backgroundColor: 'var(--tab-hover-bg, rgba(14, 15, 17, 0.05))',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              ...hoverStyle,
              opacity: hoveredIndex !== null ? 1 : 0,
            }}
          />

          {/* Active Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              height: '2px',
              backgroundColor: 'var(--tab-indicator-bg, #0e0f11)',
              transition: 'all 300ms ease-out',
              ...activeStyle
            }}
          />

          {/* Tabs */}
          <div style={{ position: 'relative', display: 'flex', gap: 'var(--tab-gap, 6px)', alignItems: 'center' }}>
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                ref={(el) => (tabRefs.current[index] = el)}
                style={{
                  padding: '4px 12px',
                  cursor: 'pointer',
                  transition: 'color 300ms',
                  height: '30px',
                  color: index === activeIndex ? 'var(--tab-active-color, #0e0e10)' : 'var(--tab-inactive-color, rgba(14, 15, 17, 0.6))'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  setActiveIndex(index)
                  onTabChange?.(tab.id)
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  {tab.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

export { Tabs }
