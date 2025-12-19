"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Plus, ArrowRight, Check, Search, Filter, MoreHorizontal,
    MessageSquare, Activity, Settings, Shield, Globe, MapPin, Zap,
    Briefcase, Share2, X, AlertCircle, Banknote, Calendar, CreditCard,
    UserPlus, UserMinus, Star, User, Send, Paperclip, Smile
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreateGroupCircle, useGetGroupCircles, useUpdateGroupCircle } from "@/services/group-circle/hook";
import { CreateGroupCircleDto, UpdateGroupCircleDto, GroupCircleType, GroupCircleDuration, GroupCircleVisibility, GroupCircleInteractionLevel, GroupCircle as ApiGroupCircle } from "@/services/group-circle/types";
import { useGetNetworkContacts } from "@/services/network-contacts/hook";


// --- Types & Constants ---

type OrbitLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface Member {
    id: string;
    name: string;
    role: "Owner" | "Admin" | "Member" | "Banker" | "Guest";
    orbit: OrbitLevel; // 1 = Core, 6 = Peripheral
    status: "active" | "online" | "offline" | "inactive";
    category: string;
    avatar?: string;
    contributions?: number; // For Smart Money
    drawDate?: string; // For Smart Money
    relationshipScore?: number; // 0-100 logic for placement
}

interface GroupCircle {
    id: string;
    name: string;
    type: "marketing" | "advertising" | "nearby" | "hyperlocal" | "national" | "global" | "finance";
    description: string;
    members: Member[];
    createdAt: string;
    durationDays: number;
}

// Optimization: Scaled down orbits for better visibility and negative space
const ORBIT_CONFIG: Record<number, { label: string; radius: number; color: string; description: string }> = {
    1: { label: "Core", radius: 12, color: "border-orange-600", description: "Critical partners & team" },
    2: { label: "Inner", radius: 24, color: "border-orange-500", description: "Frequent collaborators" },
    3: { label: "Local", radius: 36, color: "border-orange-400", description: "Nearby businesses" },
    4: { label: "Regional", radius: 48, color: "border-orange-300", description: "State/Regional reach" },
    5: { label: "National", radius: 60, color: "border-orange-200", description: "Country-wide partners" },
    6: { label: "Global", radius: 75, color: "border-zinc-200", description: "International / Peripheral" },
};

const GROUP_CIRCLE_TYPES = [
    { id: "MARKETING", name: "Marketing Circle", icon: Zap, color: "bg-blue-600", gradient: "from-blue-600 to-blue-800", mandatory: true },
    { id: "ADVERTISING", name: "Advertising Circle", icon: Globe, color: "bg-orange-600", gradient: "from-orange-600 to-red-600", mandatory: true },
    { id: "SMART_MONEY", name: "Smart Money Partner", icon: Briefcase, color: "bg-green-600", gradient: "from-green-600 to-emerald-700", mandatory: false },
    { id: "NEARBY", name: "Nearby Campaign", icon: MapPin, color: "bg-orange-500", gradient: "from-orange-500 to-amber-600", mandatory: false },
    { id: "HYPERLOCAL", name: "Hyperlocal Campaign", icon: MapPin, color: "bg-cyan-600", gradient: "from-cyan-600 to-blue-700", mandatory: false },
    { id: "NATIONAL", name: "National Campaign", icon: Globe, color: "bg-violet-600", gradient: "from-violet-600 to-purple-700", mandatory: false },
    { id: "GLOBAL", name: "Global Campaign", icon: Globe, color: "bg-indigo-600", gradient: "from-indigo-600 to-violet-700", mandatory: false },
];

const POTENTIAL_MEMBERS = [
    { name: "Alice's Bakery", category: "Food & Beverage" },
    { name: "TechSolutions Inc", category: "IT Services" },
    { name: "Global Logistics", category: "Transport" },
    { name: "Local Print Shop", category: "Media" },
    { name: "City Gym", category: "Health & Wellness" },
    { name: "Green Earth Cafe", category: "Food & Beverage" },
];

const SAMPLE_MESSAGES = [
    { sender: "them", text: "Hey! Just checking in on the new campaign.", time: "10:30 AM" },
    { sender: "me", text: "Going great! We hit 50 signups today.", time: "10:32 AM" },
    { sender: "them", text: "Fantastic news. Let's scale the ad spend next week?", time: "10:33 AM" },
    { sender: "me", text: "Agreed. I'll prepare the budget proposal.", time: "10:35 AM" },
];

// --- Mock Data ---

const MOCK_MEMBERS_POOL: Member[] = Array.from({ length: 40 }).map((_, i) => ({
    id: `m${i}`,
    name: `Partner ${i + 1}`,
    role: i === 0 ? "Owner" : "Member",
    orbit: Math.ceil(Math.random() * 6) as OrbitLevel,
    status: Math.random() > 0.3 ? "active" : "offline",
    category: ["Retail", "Service", "Tech", "Finance"][i % 4],
    contributions: Math.floor(Math.random() * 500),
    drawDate: "2024-12-25"
}));

const INITIAL_CIRCLES: GroupCircle[] = [
    {
        id: "c1",
        name: "Primary Marketing Circle",
        type: "marketing",
        description: "Core strategic marketing partners.",
        members: MOCK_MEMBERS_POOL.slice(0, 15),
        createdAt: "2024-01-15",
        durationDays: 360
    }
];

// --- Sub-Components ---

const MultiLayerRadialGraph = ({
    members,
    onMemberClick
}: {
    members: Member[],
    onMemberClick: (m: Member) => void
}) => {
    return (
        <div className="w-full h-full flex items-center justify-center p-4 overflow-visible">
            <div className="relative w-full aspect-square max-w-[800px] max-h-[800px] mx-auto isolate">

                {/* Radar Scanner Effect */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0 opacity-20">
                    <div className="w-1/2 h-1/2 absolute top-0 left-0 origin-bottom-right bg-gradient-to-tr from-transparent to-orange-400/30 animate-[spin_4s_linear_infinite]" />
                </div>

                {/* --- The Orbits (Background Rings) --- */}
                {Object.entries(ORBIT_CONFIG).reverse().map(([key, config]) => (
                    <div
                        key={key}
                        className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed transition-all duration-1000 select-none pointer-events-none",
                            Number(key) % 2 === 0 ? "border-opacity-40" : "border-opacity-20",
                            config.color,
                            "dark:border-opacity-30"
                        )}
                        style={{
                            width: `${config.radius * 2}%`,
                            height: `${config.radius * 2}%`,
                            zIndex: 0
                        }}
                    >
                        {/* Label for the Orbit - positioned at top */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] uppercase font-bold tracking-widest text-zinc-400 bg-white/80 dark:bg-zinc-950/80 backdrop-blur px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10">
                            {config.label}
                        </div>
                    </div>
                ))}

                {/* --- The Hub (Center) --- */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center text-white shadow-xl shadow-orange-500/30 border-4 border-white dark:border-zinc-900 transition-all hover:scale-105 cursor-default hover:shadow-orange-500/50">
                    <Zap className="w-4 h-4 md:w-6 md:h-6 mb-0.5 animate-pulse" />
                    <span className="text-[6px] md:text-[8px] font-bold">YOU</span>
                </div>

                {/* --- The Particles (Members) --- */}
                <AnimatePresence>
                    {members.map((member, i) => {
                        const siblings = members.filter(m => m.orbit === member.orbit);
                        const indexInOrbit = siblings.indexOf(member);
                        const totalInOrbit = siblings.length;

                        // Distribute evenly
                        const angleStep = 360 / (totalInOrbit || 1);
                        // Add slight rotation offset per ring to avoid straight lines looking weird
                        const ringOffset = member.orbit * 45;
                        const angle = (indexInOrbit * angleStep) + ringOffset;
                        const radiusPercent = ORBIT_CONFIG[member.orbit].radius;

                        // Simple Polar -> Cartesian
                        const rad = (angle * Math.PI) / 180;
                        // Adjust radius slightly inwards for visual centering on line
                        const r = radiusPercent;

                        const x = 50 + (r * Math.cos(rad));
                        const y = 50 + (r * Math.sin(rad));

                        return (
                            <motion.div
                                key={member.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                    delay: i * 0.05,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20
                                }}
                                className="absolute w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 z-20"
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    marginTop: '-1.5rem',
                                    marginLeft: '-1.5rem',
                                }}
                            >
                                {/* Connection Line (CSS Trick - rotated div) */}
                                {/* This is computationally heavy for CSS, but stunning. Let's do a simple version for Orbit 1 only to avoid clutter */}
                                {member.orbit <= 2 && (
                                    <div
                                        className="absolute top-1/2 left-1/2 h-px bg-gradient-to-r from-orange-400/50 to-transparent w-[50vh] origin-left -z-10 pointer-events-none"
                                        style={{
                                            transform: `rotate(${angle + 180}deg)`,
                                            width: `${(r / 100) * 100 * 4}px` // Approximate length calculation
                                        }}
                                    />
                                )}

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => onMemberClick(member)}
                                                className={cn(
                                                    "relative group w-full h-full rounded-full transition-all duration-300 hover:scale-125 hover:z-50 focus:outline-none focus:ring-2 focus:ring-orange-500",
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-full h-full rounded-full overflow-hidden border-2 shadow-sm bg-white dark:bg-zinc-900 transition-colors relative z-10",
                                                    member.orbit === 1 ? "border-orange-500 ring-2 ring-orange-200/50" : "border-white dark:border-zinc-700",
                                                    member.status === 'offline' && "grayscale opacity-70"
                                                )}>
                                                    <Avatar className="w-full h-full">
                                                        <AvatarFallback className={cn(
                                                            "text-[10px] md:text-xs font-bold flex items-center justify-center w-full h-full",
                                                            member.orbit === 1 ? "bg-orange-100 text-orange-700" : "bg-zinc-100 text-zinc-500"
                                                        )}>
                                                            {member.name.substring(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                {/* Status Dot */}
                                                <span className={cn(
                                                    "absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-zinc-900 z-20",
                                                    member.status === 'active' ? "bg-green-500 w-3 h-3 animate-pulse" : "bg-zinc-400 w-2.5 h-2.5"
                                                )} />

                                                {/* Ripple Effect for active */}
                                                {member.status === 'active' && <div className="absolute inset-0 rounded-full border border-green-500 animate-ping opacity-20" />}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <div className="text-center">
                                                <p className="font-bold">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.category} • {ORBIT_CONFIG[member.orbit].label}</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

// --- Invite Dialog Component ---

function InviteMemberDialog({
    open,
    onOpenChange,
    onInvite
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInvite: (member: Partial<Member>) => void;
}) {
    const [step, setStep] = useState(1);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedOrbit, setSelectedOrbit] = useState<number>(3);

    const reset = () => {
        setStep(1);
        setSelectedUser(null);
        setSelectedOrbit(3);
    }

    const handleInvite = () => {
        if (!selectedUser) return;
        onInvite({
            name: selectedUser.name,
            category: selectedUser.category,
            orbit: selectedOrbit as OrbitLevel,
            role: 'Member',
            status: 'active',
            contributions: 0
        });
        reset();
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) reset(); }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Invite Member to Circle</DialogTitle>
                    <DialogDescription>Add a new business or partner to this circle.</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-4"
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search My Network or Directory..." className="pl-9" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Suggested Contacts</Label>
                                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                                        {POTENTIAL_MEMBERS.map((m, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setSelectedUser(m)}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors",
                                                    selectedUser?.name === m.name ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-zinc-100 dark:border-zinc-800"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8"><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">{m.name}</p>
                                                        <p className="text-xs text-muted-foreground">{m.category}</p>
                                                    </div>
                                                </div>
                                                {selectedUser?.name === m.name && <Check className="w-4 h-4 text-orange-600" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-6"
                            >
                                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg flex items-center gap-3">
                                    <Avatar><AvatarFallback>{selectedUser?.name[0]}</AvatarFallback></Avatar>
                                    <div>
                                        <p className="font-bold">{selectedUser?.name}</p>
                                        <p className="text-xs text-muted-foreground">Assign relationship level</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Select Orbit Placement</Label>
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4, 5, 6].map((orbitId) => {
                                            const config = ORBIT_CONFIG[orbitId as number];
                                            return (
                                                <div
                                                    key={orbitId}
                                                    onClick={() => setSelectedOrbit(orbitId)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                                        selectedOrbit === orbitId
                                                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500"
                                                            : "hover:border-orange-300"
                                                    )}
                                                >
                                                    <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold", config.color)}>
                                                        {orbitId}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm">{config.label}</p>
                                                        <p className="text-xs text-muted-foreground">{config.description}</p>
                                                    </div>
                                                    {selectedOrbit === orbitId && <Check className="w-4 h-4 text-orange-600" />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between w-full">
                    {step === 2 ? (
                        <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    ) : (
                        <div /> /* Spacer */
                    )}

                    <Button
                        onClick={() => step === 1 ? setStep(2) : handleInvite()}
                        disabled={step === 1 && !selectedUser}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        {step === 1 ? "Next: Assign Orbit" : "Send Invitation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Page Component ---

export default function GroupCirclesPage() {
    const [activeTab, setActiveTab] = useState<"marketing" | "advertising" | "finance" | "all">("all");
    const { data: circlesData, isLoading: isLoadingCircles } = useGetGroupCircles();

    const circles = useMemo(() => {
        if (!circlesData?.data) return [];
        return circlesData.data.map(circle => ({
            ...circle,
            type: (circle.type === 'SMART_MONEY' ? 'finance' : circle.type.toLowerCase()) as any,
            durationDays: circle.duration,
            members: circle.members.map(m => ({
                id: m.id,
                name: m.network.fullName,
                role: (m.role.charAt(0).toUpperCase() + m.role.toLowerCase().slice(1)) as any,
                orbit: (m.role === 'PERIPHERAL' ? 6 : (m.role === 'OWNER' ? 1 : 3)) as OrbitLevel,
                status: (m.network.status === 'active' || m.network.status === 'accepted' ? 'active' : 'offline') as any,
                category: m.network.businessName || m.network.relationshipTag || "Partner",
                avatar: undefined,
                contributions: Number(circle.contributionAmount),
                drawDate: m.drawDate
            }))
        }));
    }, [circlesData]);

    const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);

    // Interaction State
    const [activeMember, setActiveMember] = useState<Member | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Chat
    const [chatMessages, setChatMessages] = useState(SAMPLE_MESSAGES);
    const [chatInput, setChatInput] = useState("");

    // Create Circle Wizard State
    const [createStep, setCreateStep] = useState(1);
    const [newCircleData, setNewCircleData] = useState<Partial<CreateGroupCircleDto>>({
        duration: 90,
        visibility: 'PRIVATE',
        interactionLevel: 'READ',
        contributionAmount: 0,
        networkIds: []
    });

    const { data: networkContactsData } = useGetNetworkContacts({ limit: 100 });
    const createCircleMutation = useCreateGroupCircle();
    const updateCircleMutation = useUpdateGroupCircle();

    // Computed
    const missingMandatory = useMemo(() => {
        const hasMarketing = circles.some(c => c.type.toLowerCase() === 'marketing');
        const hasAdvertising = circles.some(c => c.type.toLowerCase() === 'advertising');
        const missing = [];
        if (!hasMarketing) missing.push("Marketing Circle");
        if (!hasAdvertising) missing.push("Advertising Circle");
        return missing;
    }, [circles]);

    const selectedCircle = useMemo(() =>
        circles.find(c => c.id === selectedCircleId),
        [circles, selectedCircleId]);

    // Actions
    const handleCreateMandatory = (name: string) => {
        const typeKey = name.toLowerCase().includes("marketing") ? "MARKETING" : "ADVERTISING";
        const typeDef = GROUP_CIRCLE_TYPES.find(t => t.id === typeKey);
        if (!typeDef) return;

        setIsEditing(false);
        setNewCircleData({ ...newCircleData, type: typeDef.id as GroupCircleType });
        setCreateStep(2);
        setCreateOpen(true);
    };

    const handleEditCircle = (circle: any) => {
        const apiCircle = circlesData?.data.find(c => c.id === circle.id);
        if (!apiCircle) return;

        setIsEditing(true);
        setNewCircleData({
            name: apiCircle.name,
            description: apiCircle.description,
            type: apiCircle.type,
            duration: apiCircle.duration as any,
            visibility: apiCircle.visibility,
            interactionLevel: apiCircle.interactionLevel,
            contributionAmount: Number(apiCircle.contributionAmount),
            networkIds: apiCircle.members.map(m => m.network.id)
        });
        setCreateStep(2);
        setCreateOpen(true);
    };

    const handleSubmitCircle = async () => {
        if (!newCircleData.name || !newCircleData.type) {
            toast.error("Please fill in the required fields");
            return;
        }

        try {
            if (isEditing && selectedCircleId) {
                await updateCircleMutation.mutateAsync({
                    id: selectedCircleId,
                    data: newCircleData as UpdateGroupCircleDto
                });
                toast.success(`${newCircleData.name} updated!`);
            } else {
                await createCircleMutation.mutateAsync(newCircleData as CreateGroupCircleDto);
                toast.success(`${newCircleData.name} created!`);
            }
            setCreateOpen(false);
            setCreateStep(1);
            setNewCircleData({
                duration: 90,
                visibility: 'PRIVATE',
                interactionLevel: 'READ',
                contributionAmount: 0,
                networkIds: []
            });
        } catch (error) {
            toast.error(isEditing ? "Failed to update circle" : "Failed to create circle");
        }
    };

    const handleInviteMembers = (newMemberStub: Partial<Member>) => {
        // This will be handled by the API in future, keeping for now or updating to mutation
        toast.info("Invite functionality will be integrated with API next.");
    };

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        setChatMessages([...chatMessages, { sender: 'me', text: chatInput, time: 'Now' }]);
        setChatInput("");
    }

    const handleMemberAction = (action: string) => {
        if (!activeMember) return;
        toast.success(`${action} for ${activeMember.name}`);
        if (action === "Message") setChatOpen(true);
    };

    return (
        <div className="w-full min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 p-6 flex flex-col gap-6">

            {/* --- Header & Mandatory Check --- */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-zinc-900 dark:text-zinc-50">
                        Group Circles
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your collaborative marketing and finance networks.
                    </p>
                </div>

                <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md" onClick={() => {
                    setIsEditing(false);
                    setCreateStep(1);
                    setNewCircleData({
                        duration: 90,
                        visibility: 'PRIVATE',
                        interactionLevel: 'READ',
                        contributionAmount: 0,
                        networkIds: []
                    });
                    setCreateOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" /> New Circle
                </Button>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent className={cn(createStep === 2 ? "sm:max-w-[600px]" : "sm:max-w-[425px]")}>
                        <DialogHeader>
                            <DialogTitle>{createStep === 1 ? "Create New Circle" : (isEditing ? "Edit Circle Details" : "Circle Details")}</DialogTitle>
                            <DialogDescription>
                                {createStep === 1
                                    ? "Select the type of circle you want to build."
                                    : (isEditing ? "Update the details for this circle." : "Fill in the details for your new circle.")}
                            </DialogDescription>
                        </DialogHeader>

                        <AnimatePresence mode="wait">
                            {createStep === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="grid grid-cols-2 gap-3 py-4"
                                >
                                    {GROUP_CIRCLE_TYPES.filter(t => !t.mandatory || (t.mandatory && missingMandatory.some(m => m.toLowerCase().includes(t.id.toLowerCase())))).map(type => (
                                        <div
                                            key={type.id}
                                            onClick={() => {
                                                setNewCircleData({ ...newCircleData, type: type.id as GroupCircleType });
                                                setCreateStep(2);
                                            }}
                                            className="p-3 border rounded-xl hover:bg-orange-50 cursor-pointer transition-all hover:border-orange-500 group"
                                        >
                                            <div className={cn("w-8 h-8 rounded-lg mb-2 flex items-center justify-center text-white", type.gradient)}>
                                                <type.icon className="w-4 h-4" />
                                            </div>
                                            <p className="font-semibold text-sm group-hover:text-orange-700">{type.name}</p>
                                        </div>
                                    ))}
                                    {missingMandatory.length > 0 && (
                                        <div className="col-span-2 p-3 bg-zinc-100 rounded-lg text-xs text-muted-foreground text-center">
                                            Complete mandatory circles ({missingMandatory.join(", ")}) before creating custom ones.
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4 py-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Circle Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. Savings Group 1"
                                                value={newCircleData.name || ""}
                                                onChange={(e) => setNewCircleData({ ...newCircleData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration (Days)</Label>
                                            <Select
                                                value={String(newCircleData.duration)}
                                                onValueChange={(val) => setNewCircleData({ ...newCircleData, duration: Number(val) as GroupCircleDuration })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Duration" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[9999]" position="popper" sideOffset={5}>
                                                    {[90, 180, 270, 360].map(d => (
                                                        <SelectItem key={d} value={String(d)}>{d} Days</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            placeholder="Weekly savings circle..."
                                            value={newCircleData.description || ""}
                                            onChange={(e) => setNewCircleData({ ...newCircleData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="visibility">Visibility</Label>
                                            <Select
                                                value={newCircleData.visibility}
                                                onValueChange={(val) => setNewCircleData({ ...newCircleData, visibility: val as GroupCircleVisibility })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Visibility" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[9999]" position="popper" sideOffset={5}>
                                                    <SelectItem value="PRIVATE">Private</SelectItem>
                                                    <SelectItem value="INVITE_ONLY">Invite Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="interaction">Interaction Level</Label>
                                            <Select
                                                value={newCircleData.interactionLevel}
                                                onValueChange={(val) => setNewCircleData({ ...newCircleData, interactionLevel: val as GroupCircleInteractionLevel })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Interaction" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[9999]" position="popper" sideOffset={5}>
                                                    <SelectItem value="READ">Read</SelectItem>
                                                    <SelectItem value="MESSAGE">Message</SelectItem>
                                                    <SelectItem value="COLLABORATE">Collaborate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Contribution Amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground">£</span>
                                            <Input
                                                id="amount"
                                                type="number"
                                                className="pl-7"
                                                placeholder="50"
                                                value={newCircleData.contributionAmount || ""}
                                                onChange={(e) => setNewCircleData({ ...newCircleData, contributionAmount: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Network Contacts</Label>
                                        <ScrollArea className="h-[120px] w-full border rounded-md p-2">
                                            <div className="space-y-2">
                                                {networkContactsData?.data.map((contact) => (
                                                    <div key={contact.id} className="flex items-center space-x-2">
                                                        <Switch
                                                            id={`contact-${contact.id}`}
                                                            checked={newCircleData.networkIds?.includes(contact.id)}
                                                            onCheckedChange={(checked) => {
                                                                const currentIds = newCircleData.networkIds || [];
                                                                if (checked) {
                                                                    setNewCircleData({ ...newCircleData, networkIds: [...currentIds, contact.id] });
                                                                } else {
                                                                    setNewCircleData({ ...newCircleData, networkIds: currentIds.filter(id => id !== contact.id) });
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={`contact-${contact.id}`} className="text-sm font-normal cursor-pointer">
                                                            {contact.fullName} {contact.businessName ? `(${contact.businessName})` : ''}
                                                        </Label>
                                                    </div>
                                                ))}
                                                {(!networkContactsData || networkContactsData.data.length === 0) && (
                                                    <p className="text-xs text-muted-foreground text-center py-4">No contacts found</p>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <DialogFooter className="flex justify-between sm:justify-between w-full">
                            {createStep === 2 && (
                                <Button variant="ghost" onClick={() => setCreateStep(1)}>Back</Button>
                            )}
                            {createStep === 2 && (
                                <Button
                                    onClick={handleSubmitCircle}
                                    disabled={createCircleMutation.isPending || updateCircleMutation.isPending}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {createCircleMutation.isPending || updateCircleMutation.isPending ? "Saving..." : (isEditing ? "Update Circle" : "Create Circle")}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Mandatory Alert */}
            {missingMandatory.length > 0 && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="flex items-center gap-4 p-4 border-l-4 border-orange-600 bg-orange-50 dark:bg-orange-900/10 rounded-r-lg shadow-sm"
                >
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-orange-900 dark:text-orange-100">Action Required</h3>
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                            Per platform rules, you must establish the following circles:
                            <span className="font-bold ml-1">{missingMandatory.join(", ")}</span>.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {missingMandatory.map(m => (
                            <Button key={m} size="sm" onClick={() => handleCreateMandatory(m)} className="bg-orange-600 hover:bg-orange-700 text-white">
                                Create {m}
                            </Button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* --- Main Workspace (Height Increased for Chat) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[900px]">

                {/* Left Sidebar: Circle List */}
                <Card className="lg:col-span-3 flex flex-col h-full border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Your Circles</CardTitle>
                        <div className="flex gap-1 mt-2">
                            {['all', 'marketing', 'finance'].map(t => (
                                <Badge
                                    key={t}
                                    variant={activeTab === t ? 'default' : 'outline'}
                                    className={cn("cursor-pointer capitalize text-xs px-2", activeTab === t ? "bg-orange-600 hover:bg-orange-700" : "")}
                                    onClick={() => setActiveTab(t as any)}
                                >
                                    {t}
                                </Badge>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-3 pt-0">
                        <ScrollArea className="h-full pr-3 relative">
                            <div className="space-y-3 pt-2">
                                {isLoadingCircles ? (
                                    <div className="flex flex-col items-center justify-center h-40 space-y-2">
                                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-xs text-muted-foreground animate-pulse">Loading circles...</p>
                                    </div>
                                ) : circles.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-xs text-muted-foreground">No circles found</p>
                                    </div>
                                ) : circles.filter(c => activeTab === 'all' || (activeTab === 'finance' ? c.type === 'finance' : c.type !== 'finance')).map((circle, idx) => {
                                    const typeDef = GROUP_CIRCLE_TYPES.find(t => t.id === circle.type);
                                    return (
                                        <motion.div
                                            key={circle.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => setSelectedCircleId(circle.id)}
                                            className={cn(
                                                "p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md relative overflow-hidden group",
                                                selectedCircleId === circle.id
                                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10 ring-1 ring-orange-500"
                                                    : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-orange-200"
                                            )}
                                        >
                                            {selectedCircleId === circle.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />}
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={cn("p-1.5 rounded-lg text-white shadow-sm", typeDef?.gradient || "bg-zinc-500")}>
                                                    {typeDef?.icon && <typeDef.icon className="w-4 h-4" />}
                                                </div>
                                                <div className="flex gap-1">
                                                    <Badge variant="secondary" className="text-[10px] h-5 bg-zinc-100 dark:bg-zinc-800">{circle.members.length} Members</Badge>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-sm truncate group-hover:text-orange-700 transition-colors">{circle.name}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{circle.description}</p>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                        <Button
                            variant="outline"
                            className="w-full mt-4 border-dashed border-2 hover:border-orange-500 hover:text-orange-500"
                            onClick={() => setCreateOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Circle
                        </Button>
                    </CardContent>
                </Card>

                {/* Center: The Visualization Stage */}
                <Card className="lg:col-span-6 lg:h-full relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-black/40 flex flex-col backdrop-blur-sm">
                    {selectedCircle ? (
                        <>
                            <div className="absolute top-4 left-4 z-10 p-2 bg-white/50 dark:bg-black/50 backdrop-blur rounded-xl border shadow-sm">
                                <h2 className="text-2xl font-display font-bold text-zinc-800 dark:text-zinc-100">{selectedCircle.name}</h2>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Badge variant="outline" className={cn("border-0 text-white", GROUP_CIRCLE_TYPES.find(t => t.id === selectedCircle.type)?.gradient || "bg-zinc-500")}>
                                        {selectedCircle.type}
                                    </Badge>
                                    <span>• <span className="font-mono">{selectedCircle.durationDays}</span> Days</span>
                                </div>
                            </div>

                            {/* Toolbar */}
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                                <TooltipProvider>
                                    <Tooltip><TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" className="bg-white/80 shadow-sm hover:bg-orange-50 hover:text-orange-600 rounded-full"><Search className="w-4 h-4" /></Button>
                                    </TooltipTrigger><TooltipContent>Search Graph</TooltipContent></Tooltip>
                                    <Tooltip><TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" className="bg-white/80 shadow-sm hover:bg-orange-50 hover:text-orange-600 rounded-full"><Filter className="w-4 h-4" /></Button>
                                    </TooltipTrigger><TooltipContent>Filter Members</TooltipContent></Tooltip>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost" className="bg-white/80 shadow-sm hover:bg-orange-50 hover:text-orange-600 rounded-full">
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-32 bg-white/95 backdrop-blur-md border-orange-100 z-[10000]">
                                            <DropdownMenuItem onClick={() => handleEditCircle(selectedCircle)} className="cursor-pointer hover:bg-orange-50 text-orange-700">
                                                Edit Circle
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TooltipProvider>
                            </div>

                            {/* The Graph */}
                            <div className="flex-1 overflow-hidden relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <MultiLayerRadialGraph
                                        members={selectedCircle.members}
                                        onMemberClick={setActiveMember}
                                    />
                                </div>
                            </div>

                            {/* Bottom Controls */}
                            <div className="h-20 bg-white/90 dark:bg-zinc-900/90 border-t backdrop-blur flex items-center justify-between px-6 z-20">
                                <div className="text-xs text-muted-foreground hidden md:flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active</div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 text-zinc-600 rounded-full border border-zinc-100"><div className="w-2 h-2 rounded-full bg-zinc-300" /> Offline</div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <Button variant="outline" className="flex-1 md:flex-none border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => setInviteOpen(true)}>
                                        <UserPlus className="w-4 h-4 mr-2" /> Invite Member
                                    </Button>
                                    <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white flex-1 md:flex-none shadow-lg shadow-orange-500/20">
                                        <MessageSquare className="w-4 h-4 mr-2" /> Broadcast
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6 animate-pulse">
                                <Globe className="w-12 h-12 text-orange-200" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-700 dark:text-zinc-200">No Circle Selected</h3>
                            <p>Select a Group Circle from the sidebar to visualize the network.</p>
                        </div>
                    )}
                </Card>

                {/* Right Sidebar: Interaction & Details (Scrollable Container) */}
                <div className="lg:col-span-3 h-full flex flex-col gap-4">

                    {/* User Details Section */}
                    <div className="flex-none">
                        {activeMember ? (
                            <Card className="border-orange-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                                <div className="h-24 bg-gradient-to-r from-orange-400 to-red-600 relative p-4 flex justify-end items-start">
                                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-8 w-8" onClick={() => setActiveMember(null)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="px-6 -mt-12 mb-2 flex justify-between items-end">
                                    <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden p-1">
                                        <Avatar className="w-full h-full rounded-full">
                                            <AvatarFallback className="text-2xl font-bold bg-zinc-100 text-zinc-700">{activeMember.name[0]}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <Button size="icon" variant="outline" className="rounded-full shadow-sm" title="Add to favorites">
                                        <Star className="w-4 h-4 text-orange-400" />
                                    </Button>
                                </div>
                                <CardContent className="space-y-4 pt-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold">{activeMember.name}</h2>
                                            {activeMember.status === 'active' && <div className="w-2 h-2 rounded-full bg-green-500" title="Online" />}
                                        </div>
                                        <p className="text-orange-600 font-medium text-sm">{activeMember.category}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="p-2 bg-zinc-50 rounded-lg border">
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Role</span>
                                            <span className="font-semibold">{activeMember.role}</span>
                                        </div>
                                        <div className="p-2 bg-zinc-50 rounded-lg border">
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">Orbit</span>
                                            <span className="font-semibold text-orange-600">{ORBIT_CONFIG[activeMember.orbit].label}</span>
                                        </div>
                                    </div>

                                    {selectedCircle?.type === 'finance' && (
                                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                            <h4 className="font-semibold text-emerald-800 text-sm flex items-center gap-2 mb-2">
                                                <Banknote className="w-4 h-4" /> Smart Finance
                                            </h4>
                                            <Separator className="bg-emerald-200 mb-2" />
                                            <div className="space-y-1 text-sm text-emerald-700">
                                                <div className="flex justify-between"><span>Contribution:</span> <span className="font-mono font-bold">£{(activeMember.contributions || 0)}</span></div>
                                                <div className="flex justify-between"><span>Next Draw:</span> <span className="font-medium">Dec 24</span></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200" onClick={() => handleMemberAction("Message")}>
                                            <MessageSquare className="w-4 h-4 mr-2" /> Chat
                                        </Button>
                                        <Button variant="outline" className="w-full" onClick={() => handleMemberAction("View Profile")}>
                                            Profile
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="flex flex-col items-center justify-center text-center p-8 border-dashed bg-zinc-50/50">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <Users className="w-8 h-8 text-zinc-300" />
                                </div>
                                <h3 className="font-semibold text-zinc-600">No Member Selected</h3>
                                <p className="text-muted-foreground text-sm mt-1 max-w-[200px]">Select a node from the orbit graph to view details.</p>
                            </Card>
                        )}
                    </div>

                    {/* Chat Panel - Fixed Height & Scrollable */}
                    <Card className="flex-none flex flex-col border-t-4 border-t-orange-500 shadow-lg h-[500px] overflow-hidden">
                        <CardHeader className="py-3 px-4 border-b bg-zinc-50/50 flex flex-row items-center justify-between space-y-0 flex-none">
                            <CardTitle className="text-sm flex items-center gap-2 font-bold"><MessageSquare className="w-4 h-4 text-orange-500" /> Circle Chat</CardTitle>
                            <Badge variant="outline" className="text-[10px] font-normal">Online: 12</Badge>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-4 bg-white dark:bg-zinc-950">
                            <div className="space-y-4">
                                <div className="text-center text-[10px] text-muted-foreground my-2 uppercase tracking-widest">Today</div>
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={cn("flex gap-2", msg.sender === 'me' ? "flex-row-reverse" : "")}>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm mt-1",
                                            msg.sender === 'me' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                                        )}>
                                            {msg.sender === 'me' ? "ME" : "JD"}
                                        </div>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-xs max-w-[80%] shadow-sm",
                                            msg.sender === 'me' ? "bg-orange-600 text-white rounded-tr-none" : "bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-none"
                                        )}>
                                            <p>{msg.text}</p>
                                            <span className={cn("text-[9px] block mt-1 opacity-70", msg.sender === 'me' ? "text-orange-100" : "text-zinc-400")}>{msg.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-3 border-t bg-zinc-50/50">
                            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border rounded-full px-3 py-1 shadow-sm focus-within:ring-2 focus-within:ring-orange-500 transition-all">
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-orange-600"><Paperclip className="w-3 h-3" /></Button>
                                <input
                                    className="flex-1 bg-transparent border-0 text-xs focus:outline-none h-8"
                                    placeholder="Type a message..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-orange-600"><Smile className="w-3 h-3" /></Button>
                                <Button size="icon" className="h-7 w-7 rounded-full bg-orange-600 text-white hover:bg-orange-700" onClick={handleSendMessage}><Send className="w-3 h-3 ml-0.5" /></Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Invites Dialog */}
            <InviteMemberDialog
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                onInvite={handleInviteMembers}
            />
        </div>
    );
}
