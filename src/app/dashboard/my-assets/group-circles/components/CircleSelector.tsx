"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ChevronDown,
    Activity,
    Globe,
    Check,
    Zap,
    Filter,
    X,
    SlidersHorizontal,
    Users,
    Calendar,
    ArrowUpDown,
    LayoutGrid,
    List,
    Sparkles,
    MapPin,
    Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    // Graph filters
    focusedOrbits: number[] | null;
    setFocusedOrbits: (orbits: number[] | null) => void;
    relationshipFilter: string | null;
    setRelationshipFilter: (filter: string | null) => void;
}

export const CircleSelector = React.memo(({
    selectedCircle,
    circleSearch,
    setCircleSearch,
    isLoadingCircles,
    circles,
    selectedCircleId,
    setSelectedCircleId,
    groupCircleTypes,
    focusedOrbits,
    setFocusedOrbits,
    relationshipFilter,
    setRelationshipFilter
}: CircleSelectorProps) => {
    const [showFilters, setShowFilters] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("newest");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");

    // Filter and sort circles
    const filteredCircles = useMemo(() => {
        let result = [...circles];

        // Apply search filter
        if (circleSearch) {
            result = result.filter(c =>
                c.name.toLowerCase().includes(circleSearch.toLowerCase()) ||
                c.type.toLowerCase().includes(circleSearch.toLowerCase())
            );
        }

        // Apply type filter
        if (typeFilter !== "all") {
            result = result.filter(c => c.type === typeFilter);
        }

        // Apply sorting
        switch (sortBy) {
            case "name":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "members":
                result.sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0));
                break;
            case "oldest":
                result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
                break;
            case "newest":
            default:
                result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                break;
        }

        return result;
    }, [circles, circleSearch, typeFilter, sortBy]);

    const activeFiltersCount = [
        typeFilter !== "all",
        focusedOrbits !== null,
        relationshipFilter !== null,
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        setTypeFilter("all");
        setCircleSearch("");
        setFocusedOrbits(null);
        setRelationshipFilter(null);
    };

    // Location tag options for graph filtering
    const locationTags = [
        { id: "nearby", label: "Nearby", orbits: [1, 2], color: "bg-orange-600" },
        { id: "hyperlocal", label: "Hyperlocal", orbits: [3, 4], color: "bg-orange-500" },
        { id: "national", label: "National", orbits: [5, 6], color: "bg-orange-400" },
    ];

    const relationshipTags = ["Supplier", "Partner", "Affiliate"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg shadow-orange-500/5 overflow-hidden"
        >
            {/* Main Search Bar Row */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Active Circle Indicator */}
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800/50 rounded-xl">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600 dark:text-orange-400">Active Circle</span>
                            <p className="text-sm font-bold text-orange-900 dark:text-orange-100 truncate max-w-[120px]">
                                {selectedCircle?.name || "None Selected"}
                            </p>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Search circles by name or type..."
                            className="pl-11 h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                            value={circleSearch}
                            onChange={(e) => setCircleSearch(e.target.value)}
                        />
                        {circleSearch && (
                            <button
                                onClick={() => setCircleSearch("")}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                        {/* Type Filter */}
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="h-12 min-w-[160px] bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-zinc-400" />
                                    <SelectValue placeholder="Circle Type" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                                <SelectItem value="all">All Types</SelectItem>
                                {groupCircleTypes.map(type => (
                                    <SelectItem key={type.id} value={type.id}>
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-3 rounded", type.color)} />
                                            {type.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sort By */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-12 min-w-[150px] bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-4 h-4 text-zinc-400" />
                                    <SelectValue placeholder="Sort by" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="z-[10000]">
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="name">Name A-Z</SelectItem>
                                <SelectItem value="members">Most Members</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* More Filters Button */}
                        <Button
                            variant="outline"
                            className={cn(
                                "h-12 px-4 rounded-xl border-zinc-200 dark:border-zinc-700 transition-all",
                                showFilters && "bg-orange-50 border-orange-300 text-orange-600"
                            )}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <Badge className="ml-2 bg-orange-600 text-white px-1.5 py-0 text-[10px]">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Active Filters Tags */}
                {activeFiltersCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex-wrap"
                    >
                        <span className="text-xs text-zinc-500">Active filters:</span>
                        {typeFilter !== "all" && (
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 cursor-pointer"
                                onClick={() => setTypeFilter("all")}
                            >
                                Type: {groupCircleTypes.find(t => t.id === typeFilter)?.name || typeFilter}
                                <X className="w-3 h-3 ml-1" />
                            </Badge>
                        )}
                        {focusedOrbits && (
                            <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 cursor-pointer"
                                onClick={() => setFocusedOrbits(null)}
                            >
                                Location: {locationTags.find(t => t.orbits.toString() === focusedOrbits.toString())?.label || "Custom"}
                                <X className="w-3 h-3 ml-1" />
                            </Badge>
                        )}
                        {relationshipFilter && (
                            <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 cursor-pointer"
                                onClick={() => setRelationshipFilter(null)}
                            >
                                Relationship: {relationshipFilter}
                                <X className="w-3 h-3 ml-1" />
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="text-xs text-zinc-500 hover:text-red-600 ml-auto"
                        >
                            Clear All
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Advanced Filters
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowFilters(false)}
                                    className="text-xs text-zinc-400 hover:text-zinc-600"
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    Close
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Circle Type Quick Filters */}
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 mb-2 block">Quick Type Filters</label>
                                    <div className="flex flex-wrap gap-2">
                                        {groupCircleTypes.slice(0, 4).map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setTypeFilter(typeFilter === type.id ? "all" : type.id)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                                                    typeFilter === type.id
                                                        ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/30"
                                                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-orange-300 hover:text-orange-600"
                                                )}
                                            >
                                                {type.name.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Location Tags - Graph Filter */}
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Location Tags (Graph)
                                    </label>
                                    <Select
                                        value={focusedOrbits ? focusedOrbits.toString() : "all"}
                                        onValueChange={(val) => {
                                            if (val === "all") {
                                                setFocusedOrbits(null);
                                            } else {
                                                // Find the tag that matches the comma-separated string
                                                const tag = locationTags.find(t => t.orbits.toString() === val);
                                                if (tag) setFocusedOrbits(tag.orbits);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-9 w-full bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg text-xs">
                                            <SelectValue placeholder="All Locations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Locations</SelectItem>
                                            {locationTags.map(tag => (
                                                <SelectItem key={tag.id} value={tag.orbits.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full", tag.color)} />
                                                        {tag.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Relationship Tags - Graph Filter */}
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        Relationship Tags (Graph)
                                    </label>
                                    <Select
                                        value={relationshipFilter || "all"}
                                        onValueChange={(val) => setRelationshipFilter(val === "all" ? null : val)}
                                    >
                                        <SelectTrigger className="h-9 w-full bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-lg text-xs">
                                            <SelectValue placeholder="All Relationships" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Relationships</SelectItem>
                                            {relationshipTags.map(tag => (
                                                <SelectItem key={tag} value={tag}>
                                                    {tag}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* View Mode Toggle */}
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 mb-2 block">View Mode</label>
                                    <div className="flex gap-1 p-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                        <button
                                            onClick={() => setViewMode("list")}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                                                viewMode === "list"
                                                    ? "bg-orange-600 text-white shadow"
                                                    : "text-zinc-500 hover:text-zinc-700"
                                            )}
                                        >
                                            <List className="w-3.5 h-3.5" />
                                            List
                                        </button>
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                                                viewMode === "grid"
                                                    ? "bg-orange-600 text-white shadow"
                                                    : "text-zinc-500 hover:text-zinc-700"
                                            )}
                                        >
                                            <LayoutGrid className="w-3.5 h-3.5" />
                                            Grid
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Graph Filter Info */}
                            {(focusedOrbits || relationshipFilter) && (
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
                                    <Target className="w-4 h-4 text-blue-600" />
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Graph filters are active. Members on the visualization are filtered based on your selection.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Circle List/Grid */}
            <div className="p-4">
                {/* Results Count */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-zinc-500">
                        Showing <span className="font-bold text-zinc-700">{filteredCircles.length}</span> of {circles.length} circles
                    </p>
                    {circleSearch && (
                        <p className="text-xs text-orange-600">
                            Results for "{circleSearch}"
                        </p>
                    )}
                </div>

                <ScrollArea className="h-[280px]">
                    {isLoadingCircles ? (
                        <div className="py-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-3">
                                <Activity className="w-6 h-6 text-orange-500 animate-spin" />
                            </div>
                            <p className="text-sm text-zinc-500">Loading your circles...</p>
                        </div>
                    ) : filteredCircles.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
                                <Globe className="w-8 h-8 text-zinc-300" />
                            </div>
                            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">No circles found</h4>
                            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                                {circleSearch || typeFilter !== "all"
                                    ? "Try adjusting your filters or search terms"
                                    : "Create your first circle to get started"}
                            </p>
                            {(circleSearch || typeFilter !== "all") && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                    onClick={clearAllFilters}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : viewMode === "grid" ? (
                        /* Grid View */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredCircles.map((circle) => {
                                const typeDef = groupCircleTypes.find(t => t.id === circle.type);
                                const isActive = selectedCircleId === circle.id;
                                return (
                                    <motion.button
                                        key={circle.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedCircleId(circle.id);
                                            setCircleSearch("");
                                        }}
                                        className={cn(
                                            "relative p-4 rounded-xl border transition-all text-left group",
                                            isActive
                                                ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 shadow-lg shadow-orange-500/10"
                                                : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-orange-300 hover:shadow-md"
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute top-2 right-2">
                                                <Check className="w-4 h-4 text-orange-600" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg",
                                            `bg-gradient-to-br ${typeDef?.gradient || "from-zinc-400 to-zinc-500"}`
                                        )}>
                                            {typeDef?.icon && <typeDef.icon className="w-5 h-5" />}
                                        </div>
                                        <h4 className={cn(
                                            "text-sm font-bold truncate mb-1",
                                            isActive ? "text-orange-900" : "text-zinc-800 dark:text-zinc-100"
                                        )}>
                                            {circle.name}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                            <Users className="w-3 h-3" />
                                            <span>{circle.members?.length || 0} members</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    ) : (
                        /* List View */
                        <div className="space-y-2">
                            {filteredCircles.map((circle) => {
                                const typeDef = groupCircleTypes.find(t => t.id === circle.type);
                                const isActive = selectedCircleId === circle.id;
                                return (
                                    <motion.button
                                        key={circle.id}
                                        whileHover={{ x: 4 }}
                                        onClick={() => {
                                            setSelectedCircleId(circle.id);
                                            setCircleSearch("");
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                                            isActive
                                                ? "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 shadow-lg shadow-orange-500/10"
                                                : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 hover:border-orange-200 hover:shadow-md"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg transition-transform group-hover:scale-105",
                                            `bg-gradient-to-br ${typeDef?.gradient || "from-zinc-400 to-zinc-500"}`
                                        )}>
                                            {typeDef?.icon && <typeDef.icon className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1 text-left overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                <h4 className={cn(
                                                    "text-sm font-bold truncate",
                                                    isActive ? "text-orange-900 dark:text-orange-100" : "text-zinc-800 dark:text-zinc-100"
                                                )}>
                                                    {circle.name}
                                                </h4>
                                                {isActive && (
                                                    <Badge className="bg-orange-600 text-white text-[9px] px-1.5 py-0">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <Badge variant="outline" className="text-[9px] py-0 h-4 font-medium">
                                                    {circle.type.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {circle.members?.length || 0} members
                                                </span>
                                                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {circle.durationDays || 90} days
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {isActive ? (
                                                <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-zinc-300 group-hover:text-orange-500 -rotate-90 transition-all" />
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </motion.div>
    );
});

CircleSelector.displayName = "CircleSelector";
