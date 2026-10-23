import React from 'react'
import { clsx } from 'clsx'

export interface Column<T> {
  key: string
  header: React.ReactNode
  render?: (row: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T, index: number) => string
  emptyMessage?: string
  className?: string
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  className,
}: TableProps<T>) {
  return (
    <div className={clsx('w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)]', className)}>
      <div className="overflow-x-auto relative">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[var(--surface-muted)] text-xs font-semibold text-[var(--muted)] border-b border-[var(--border)] sticky top-0 uppercase tracking-wider">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  className={clsx(
                    'px-4 py-3 select-none',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-[var(--ink)]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-[var(--muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row, idx)}
                  className="hover:bg-[var(--surface)] transition-colors duration-100"
                >
                  {columns.map(col => {
                    const value = (row as Record<string, unknown>)[col.key]
                    return (
                      <td
                        key={col.key}
                        className={clsx(
                          'px-4 py-3.5 align-middle',
                          col.align === 'right' && 'text-right tabular-nums',
                          col.align === 'center' && 'text-center',
                          col.className
                        )}
                      >
                        {col.render ? col.render(row, idx) : (value as React.ReactNode)}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
