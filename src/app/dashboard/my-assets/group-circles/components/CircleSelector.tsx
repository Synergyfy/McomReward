"use client";

import React from "react";
import { Search, ChevronDown, Activity, Globe, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CircleSelectorProps {
    selectedCircle: any;
    circleSearch: string;
    setCircleSearch: (val: string) => void;
    isLoadingCircles: boolean;
    circles: any[];
    selectedCircleId: string | null;
    setSelectedCircleId: (id: string) => void;
    groupCircleTypes: any[];
}

export const CircleSelector = React.memo(({
    selectedCircle,
    circleSearch,
    setCircleSearch,
    isLoadingCircles,
    circles,
    selectedCircleId,
    setSelectedCircleId,
    groupCircleTypes
}: CircleSelectorProps) => {
    return (
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border rounded-2xl p-2 flex items-center gap-2 shadow-sm">
            <div className="flex-none px-3 border-r pr-4 hidden md:block">
                <span className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground block">Active</span>
                <span className="text-xs font-bold text-orange-600">Circles</span>
            </div>

            <div className="flex-1 px-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full md:w-[300px] justify-between bg-white/50 border-zinc-200 dark:border-zinc-800 rounded-xl h-10 px-4 hover:bg-white transition-all shadow-sm group"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                {selectedCircle ? (
                                    <>
                                        <div className={cn(
                                            "w-5 h-5 rounded-lg flex items-center justify-center text-white shrink-0",
                                            groupCircleTypes.find(t => t.id === selectedCircle.type)?.gradient || "bg-zinc-400"
                                        )}>
                                            {React.createElement(groupCircleTypes.find(t => t.id === selectedCircle.type)?.icon || Zap, { className: "w-3 h-3" })}
                                        </div>
                                        <span className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100 italic">
                                            {selectedCircle.name}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">Select a Circle...</span>
                                )}
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="w-[300px] p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-orange-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-[10000]"
                    >
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search your circles..."
                                className="pl-9 h-9 text-xs rounded-xl border-zinc-100 dark:border-zinc-800 bg-zinc-50/50"
                                value={circleSearch}
                                onChange={(e) => setCircleSearch(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[250px]">
                            <div className="space-y-1">
                                {isLoadingCircles ? (
                                    <div className="py-8 text-center">
                                        <Activity className="w-5 h-5 text-orange-500 animate-spin mx-auto mb-2" />
                                        <p className="text-[10px] text-muted-foreground">Loading circles...</p>
                                    </div>
                                ) : circles.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <Globe className="w-5 h-5 text-zinc-300 mx-auto mb-2" />      
                                        <p className="text-[10px] text-muted-foreground">No circles found</p>
                                    </div>
                                ) : circles
                                    .filter(c => c.name.toLowerCase().includes(circleSearch.toLowerCase()))
                                    .map((circle) => {
                                        const typeDef = groupCircleTypes.find(t => t.id === circle.type);
                                        const isActive = selectedCircleId === circle.id;
                                        return (
                                            <button
                                                key={circle.id}
                                                onClick={() => {
                                                    setSelectedCircleId(circle.id);
                                                    setCircleSearch("");
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group/item",
                                                    isActive
                                                        ? "bg-orange-50 dark:bg-orange-950/20 text-orange-700"
                                                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm",
                                                    typeDef?.gradient || "bg-zinc-400"
                                                )}>
                                                    {typeDef?.icon && <typeDef.icon className="w-4 h-4" />}
                                                </div>
                                                <div className="text-left overflow-hidden">
                                                    <p className={cn(
                                                        "text-xs font-bold truncate",
                                                        isActive ? "text-orange-900 dark:text-orange-100" : "text-zinc-700 dark:text-zinc-300"
                                                    )}>
                                                        {circle.name}
                                                    </p>
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">
                                                        {circle.type.replace('_', ' ')}
                                                    </p>
                                                </div>
                                                {isActive && (
                                                    <Check className="w-4 h-4 ml-auto text-orange-600" />
                                                )}
                                            </button>
                                        );
                                    })}
                            </div>
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
});

CircleSelector.displayName = "CircleSelector";
