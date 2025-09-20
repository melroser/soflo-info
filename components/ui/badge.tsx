import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/20",
    {
        variants: {
            variant: {
                default: "border-transparent bg-red-600 text-white hover:bg-red-500",
                secondary: "border-white/20 bg-white/10 text-white hover:bg-white/20",
                outline: "border-white/40 text-white",
                success: "border-transparent bg-emerald-600 text-white hover:bg-emerald-500",
                warning: "border-transparent bg-amber-500 text-black hover:bg-amber-400",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
