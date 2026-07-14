'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useInView } from '@/hooks/use-in-view'

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
  animationClass?: string
  delayMs?: number
  once?: boolean
}

export function Reveal({
  as = 'div',
  animationClass = 'fade-in',
  delayMs = 0,
  className,
  children,
  ...rest
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const Comp: React.ElementType = as

  return (
    <Comp
      ref={ref}
      className={cn(inView ? animationClass : 'opacity-0 translate-y-2', className)}
      style={inView ? { animationDelay: `${delayMs}ms` } : undefined}
      {...rest}
    >
      {children}
    </Comp>
  )
}
