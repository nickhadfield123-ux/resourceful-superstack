"use client"

import * as React from "react"

interface AlertDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface AlertDialogTriggerProps {
  children: React.ReactNode
  onClick?: () => void
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogHeaderProps {
  children: React.ReactNode
}

interface AlertDialogTitleProps {
  children: React.ReactNode
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode
}

interface AlertDialogFooterProps {
  children: React.ReactNode
}

interface AlertDialogActionProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

interface AlertDialogCancelProps {
  children: React.ReactNode
  onClick?: () => void
}

export function AlertDialog({ children, open, onOpenChange }: AlertDialogProps) {
  // If controlled, use provided state and callbacks
  if (open !== undefined && onOpenChange !== undefined) {
    return (
      <div>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === AlertDialogTrigger) {
              return React.cloneElement(child as React.ReactElement<AlertDialogTriggerProps>, {
                onClick: () => {
                  onOpenChange(true)
                  if ((child.props as AlertDialogTriggerProps).onClick) {
                    (child.props as AlertDialogTriggerProps).onClick?.()
                  }
                }
              })
            }
            if (child.type === AlertDialogContent) {
              return React.cloneElement(child as React.ReactElement<AlertDialogContentProps>, {
                className: open ? ((child.props as AlertDialogContentProps).className || '') : 'hidden'
              })
            }
            if (child.type === AlertDialogCancel) {
              return React.cloneElement(child as React.ReactElement<AlertDialogCancelProps>, {
                onClick: () => {
                  onOpenChange(false)
                  if ((child.props as AlertDialogCancelProps).onClick) {
                    (child.props as AlertDialogCancelProps).onClick?.()
                  }
                }
              })
            }
            if (child.type === AlertDialogAction) {
              return React.cloneElement(child as React.ReactElement<AlertDialogActionProps>, {
                onClick: () => {
                  onOpenChange(false)
                  if ((child.props as AlertDialogActionProps).onClick) {
                    (child.props as AlertDialogActionProps).onClick?.()
                  }
                }
              })
            }
          }
          return child
        })}
      </div>
    )
  }
  
  // If uncontrolled, manage internal state
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AlertDialogTrigger) {
            return React.cloneElement(child as React.ReactElement<AlertDialogTriggerProps>, {
              onClick: () => {
                setInternalOpen(true)
                if ((child.props as AlertDialogTriggerProps).onClick) {
                  (child.props as AlertDialogTriggerProps).onClick?.()
                }
              }
            })
          }
          if (child.type === AlertDialogContent) {
            return React.cloneElement(child as React.ReactElement<AlertDialogContentProps>, {
              className: internalOpen ? ((child.props as AlertDialogContentProps).className || '') : 'hidden'
            })
          }
          if (child.type === AlertDialogCancel) {
            return React.cloneElement(child as React.ReactElement<AlertDialogCancelProps>, {
              onClick: () => {
                setInternalOpen(false)
                if ((child.props as AlertDialogCancelProps).onClick) {
                  (child.props as AlertDialogCancelProps).onClick?.()
                }
              }
            })
          }
          if (child.type === AlertDialogAction) {
            return React.cloneElement(child as React.ReactElement<AlertDialogActionProps>, {
              onClick: () => {
                setInternalOpen(false)
                if ((child.props as AlertDialogActionProps).onClick) {
                  (child.props as AlertDialogActionProps).onClick?.()
                }
              }
            })
          }
        }
        return child
      })}
    </div>
  )
}

export function AlertDialogTrigger({ children, onClick }: AlertDialogTriggerProps) {
  return (
    <button onClick={onClick} type="button">
      {children}
    </button>
  )
}

export function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className || ""}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  )
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return <div className="mb-4">{children}</div>
}

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return <h3 className="text-lg font-semibold">{children}</h3>
}

export function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return <p className="text-sm text-gray-600">{children}</p>
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return <div className="flex justify-end space-x-2 mt-4">{children}</div>
}

export function AlertDialogAction({ children, onClick, disabled, className }: AlertDialogActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
    >
      {children}
    </button>
  )
}

export function AlertDialogCancel({ children, onClick }: AlertDialogCancelProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
    >
      {children}
    </button>
  )
}