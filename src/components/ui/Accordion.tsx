import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '../../lib/cn'

type AccordionItemProps = {
  question: string
  children: ReactNode
  className?: string
}

/** Native details/summary, plus icon rotates into an X on open (spec §4). */
export function AccordionItem({
  question,
  children,
  className,
}: AccordionItemProps) {
  return (
    <details className={cn('group border-b border-border py-5', className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
        {question}
        <Plus
          className="h-[18px] w-[18px] flex-none text-muted transition-transform duration-200 group-open:rotate-45"
          aria-hidden="true"
        />
      </summary>
      <div className="pt-3 text-sm text-muted">{children}</div>
    </details>
  )
}
