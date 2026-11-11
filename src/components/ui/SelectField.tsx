import { useId } from 'react'
import { cn } from '../../lib/cn'

type SelectOption = { value: string; label: string }

type SelectFieldProps = {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  className?: string
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  className,
}: SelectFieldProps) {
  const id = useId()

  // Hidden automatically when there's only one option to choose from.
  if (options.length <= 1) return null

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex min-w-[120px] flex-col gap-0.5 rounded-md border border-border bg-surface px-3 py-1.5',
        'has-[select:focus-visible]:outline has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-2 has-[select:focus-visible]:outline-red',
        className,
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
        {label}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border-0 bg-transparent p-0 font-sans text-sm font-semibold text-text focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
