"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type PremiumCalendarProps = React.ComponentProps<typeof DayPicker> & {
    disablePastDates?: boolean;
}

function PremiumCalendar({
    className,
    classNames,
    showOutsideDays = true,
    disablePastDates = true,
    ...props
}: PremiumCalendarProps) {
    const defaultClassNames = getDefaultClassNames()
    const disabledDays = disablePastDates ? { before: new Date() } : undefined;
    const mergedDisabled = props.disabled
        ? (Array.isArray(props.disabled) ? [...props.disabled, disabledDays].filter(Boolean) : [props.disabled, disabledDays].filter(Boolean))
        : disabledDays;

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            disabled={mergedDisabled as any}
            className={cn("p-6", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-6",
                month_caption: "flex justify-center pt-2 relative items-center mb-4",
                caption_label: "text-lg font-bold tracking-tight text-gray-900",
                nav: "absolute top-2 left-0 right-0 flex justify-between px-2",
                button_previous: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-10 w-10 bg-transparent p-0 hover:bg-gray-100 rounded-full transition-all"
                ),
                button_next: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-10 w-10 bg-transparent p-0 hover:bg-gray-100 rounded-full transition-all"
                ),
                month_grid: "w-full border-collapse space-y-2",
                weekdays: "flex mb-2",
                weekday: "text-gray-400 w-11 font-medium text-[0.85rem] uppercase tracking-widest text-center",
                week: "flex w-full mt-2",
                day: "p-0 relative focus-within:z-20",
                day_button: cn(
                    "h-11 w-11 p-0 font-semibold text-sm transition-all rounded-full hover:bg-primary/10 hover:text-primary aria-selected:opacity-100",
                    "focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none"
                ),
                selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-full shadow-lg shadow-primary/20",
                today: "text-primary bg-primary/5 font-bold",
                outside: "text-gray-300 opacity-50",
                disabled: "text-gray-200 cursor-not-allowed",
                range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    if (orientation === "left") return <ChevronLeftIcon className="h-5 w-5" />;
                    return <ChevronRightIcon className="h-5 w-5" />;
                },
            }}
            {...props}
        />
    )
}
PremiumCalendar.displayName = "PremiumCalendar"

export { PremiumCalendar }
