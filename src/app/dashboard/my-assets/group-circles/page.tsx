"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Plus, ArrowRight, Check, Search, Filter, MoreHorizontal,
    MessageSquare, Activity, Settings, Shield, Globe, MapPin, Zap,
    Briefcase, Share2, X, AlertCircle, Banknote, Calendar, CreditCard,
    UserPlus, UserMinus, Star, User, Send, Paperclip, Smile, Wallet
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
import { useCreateGroupCircle, useGetGroupCircles, useUpdateGroupCircle, useRemoveGroupCircleMember, useGetGroupCircleMessages, useSendMessage, useAddCircleMember } from "@/services/group-circle/hook";
import { CreateGroupCircleDto, UpdateGroupCircleDto, GroupCircleType, GroupCircleDuration, GroupCircleVisibility, GroupCircleInteractionLevel, GroupCircle as ApiGroupCircle, SendMessageDto, AddMemberDto } from "@/services/group-circle/types";
import { useGetNetworkContacts } from "@/services/network-contacts/hook";
import { useGetBusinessProfile } from "@/services/business/hook";
import { ContributionDialog } from "./ContributionDialog";


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

// --- Mock Data ---
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
    onMemberClick,
    currentMemberId
}: {
    members: Member[],
    onMemberClick: (m: Member) => void,
    currentMemberId?: string | null
}) => {
    const me = members.find(m => m.id === currentMemberId) ||
        members.find(m => m.role.toLowerCase() === 'owner');

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
                <div
                    onClick={() => {
                        if (me) {
                            onMemberClick(me);
                        } else {
                            toast.error("You are not identified as a member of this circle.");
                        }
                    }}
                    className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex flex-col items-center justify-center text-white shadow-xl shadow-orange-500/30 border-4 border-white dark:border-zinc-900 transition-all hover:scale-105 select-none cursor-pointer hover:shadow-orange-500/50 pointer-events-auto"
                    )}
                >
                    <Zap className="w-4 h-4 md:w-6 md:h-6 mb-0.5 animate-pulse pointer-events-none" />
                    <span className="text-[6px] md:text-[8px] font-bold pointer-events-none">YOU</span>
                </div>

                {/* --- The Particles (Members) --- */}
                <AnimatePresence>
                    {members.filter(m => m.id !== (me?.id || null)).map((member, i) => {
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
    onInvite: (member: AddMemberDto) => void;
}) {
    const [step, setStep] = useState(1);
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<'CORE' | 'PERIPHERAL' | 'BANKER' | 'PARTNER'>('PERIPHERAL');
    const [searchQuery, setSearchQuery] = useState("");

    const { data: networkContactsData, isLoading: isLoadingContacts } = useGetNetworkContacts({
        search: searchQuery,
        page: 1,
        limit: 50
    });

    const reset = () => {
        setStep(1);
        setSelectedContactId(null);
        setSelectedRole('PERIPHERAL');
        setSearchQuery("");
    }

    const handleInvite = () => {
        if (!selectedContactId) return;
        onInvite({
            networkId: selectedContactId,
            role: selectedRole
        });
        reset();
        onOpenChange(false);
    }

    const filteredContacts = networkContactsData?.data || [];
    const selectedContact = filteredContacts.find(c => c.id === selectedContactId);

    const ROLES = [
        { id: 'CORE', name: 'CORE', description: 'Essential primary partners or internal team members who drive the core value of this circle.' },
        { id: 'PARTNER', name: 'PARTNER', description: 'Strategic collaborators with regular interaction and shared objectives.' },
        { id: 'BANKER', name: 'BANKER', description: 'Partners specifically focused on financial management, capital, or transaction processing.' },
        { id: 'PERIPHERAL', name: 'PERIPHERAL', description: 'Occasional collaborators or support businesses that provide periodic value.' },
    ] as const;

    return (
        <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) reset(); }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-xl font-bold">Invite Member to Circle</DialogTitle>
                    <DialogDescription>Expand your collaborative network with real-time connectivity.</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4 px-6"
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search My Network..."
                                        className="pl-9 h-11 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Network Contacts</Label>
                                    <ScrollArea className="h-[250px] -mx-2 pr-2">
                                        <div className="grid grid-cols-1 gap-1.5 px-2">
                                            {isLoadingContacts ? (
                                                <div className="flex flex-col items-center justify-center py-10 gap-2">
                                                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Searching...</p>
                                                </div>
                                            ) : filteredContacts.length > 0 ? (
                                                filteredContacts.map((contact) => (
                                                    <div
                                                        key={contact.id}
                                                        onClick={() => setSelectedContactId(contact.id)}
                                                        className={cn(
                                                            "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group",
                                                            selectedContactId === contact.id
                                                                ? "border-orange-500 bg-orange-50 shadow-sm"
                                                                : "border-zinc-100 hover:border-orange-200 hover:bg-zinc-50/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                                                                {contact.fullName[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-zinc-800">{contact.fullName}</p>
                                                                <p className="text-[10px] text-muted-foreground font-medium">{contact.businessName || 'Independent Partner'}</p>
                                                            </div>
                                                        </div>
                                                        {selectedContactId === contact.id ? (
                                                            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded-full border border-zinc-200 group-hover:border-orange-300 transition-colors" />
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 bg-zinc-50 rounded-2xl">
                                                    <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                                                    <p className="text-xs text-zinc-500 italic">No contacts found in network.</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 px-6"
                            >
                                <div className="bg-orange-600 rounded-[28px] p-5 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 blur-3xl rounded-full" />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black">
                                            {selectedContact?.fullName[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-lg tracking-tight leading-tight">{selectedContact?.fullName}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-0.5">Define Collaboration Role</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest ml-1">Select Access Level</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <TooltipProvider delayDuration={0}>
                                            {ROLES.map((role) => (
                                                <Tooltip key={role.id}>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            onClick={() => setSelectedRole(role.id)}
                                                            className={cn(
                                                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                                                selectedRole === role.id
                                                                    ? "border-orange-500 bg-orange-50/50"
                                                                    : "border-zinc-100 hover:border-orange-200"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                                                                    selectedRole === role.id ? "bg-orange-500 text-white" : "bg-zinc-100 text-zinc-500"
                                                                )}>
                                                                    {role.name[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-sm text-zinc-800">{role.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-bold truncate max-w-[200px]">
                                                                        {role.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {selectedRole === role.id && <Check className="w-4 h-4 text-orange-600" />}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" className="max-w-[250px] p-3 rounded-xl border-orange-100 bg-white shadow-xl z-[10001]">
                                                        <p className="text-xs font-bold text-zinc-800 mb-1">{role.name} Status</p>
                                                        <p className="text-[10px] text-zinc-500 leading-relaxed">{role.description}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="px-6 pb-6 pt-2 flex flex-row items-center justify-between gap-3">
                    {step === 2 ? (
                        <Button variant="ghost" onClick={() => setStep(1)} className="h-11 px-6 rounded-xl font-bold flex-1">Back</Button>
                    ) : (
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-11 px-6 rounded-xl font-bold flex-1 text-zinc-400">Cancel</Button>
                    )}

                    <Button
                        onClick={() => step === 1 ? setStep(2) : handleInvite()}
                        disabled={step === 1 && !selectedContactId}
                        className="h-11 px-8 rounded-xl font-bold bg-zinc-900 text-white hover:bg-black transition-all flex-[2] shadow-lg shadow-zinc-200"
                    >
                        {step === 1 ? (
                            <span className="flex items-center gap-2">Next Step <ArrowRight className="w-4 h-4" /></span>
                        ) : (
                            <span className="flex items-center gap-2">Send Invitation <Check className="w-4 h-4" /></span>
                        )}
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
            members: circle.members.map(m => {
                let orbit: OrbitLevel = 6;
                const loc = m.network.locationTag?.toLowerCase();
                if (loc === 'nearby') orbit = 1;
                else if (loc === 'hyperlocal') orbit = 3;
                else if (loc === 'national') orbit = 5;
                else if (m.role === 'OWNER') orbit = 1;

                return {
                    id: m.id,
                    name: m.network.fullName,
                    email: m.network.email,
                    role: (m.role.charAt(0).toUpperCase() + m.role.toLowerCase().slice(1)) as any,
                    orbit,
                    status: (m.network.status === 'active' || m.network.status === 'accepted' ? 'active' : 'offline') as any,
                    category: m.network.businessName || m.network.relationshipTag || "Partner",
                    avatar: undefined,
                    contributions: Number(circle.contributionAmount),
                    drawDate: m.drawDate
                };
            })
        }));
    }, [circlesData]);

    const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);

    // Interaction State
    const [activeMember, setActiveMember] = useState<Member | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [contributionOpen, setContributionOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Chat
    const [chatInput, setChatInput] = useState("");
    const [chatType, setChatType] = useState<'GROUP' | 'DIRECT'>('GROUP');
    const [chatMemberId, setChatMemberId] = useState<string | null>(null);
    const [isChatOverlayOpen, setIsChatOverlayOpen] = useState(false);

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
    const { data: profile } = useGetBusinessProfile();
    const createCircleMutation = useCreateGroupCircle();
    const updateCircleMutation = useUpdateGroupCircle();
    const removeMemberMutation = useRemoveGroupCircleMember();
    const addMemberMutation = useAddCircleMember();

    const { data: messagesData, isLoading: isLoadingMessages } = useGetGroupCircleMessages(
        selectedCircleId,
        {
            type: chatType,
            memberId: chatType === 'DIRECT' ? chatMemberId || undefined : undefined,
            limit: 50
        }
    );
    const sendMessageMutation = useSendMessage();

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

    const myMemberId = useMemo(() => {
        if (!selectedCircle || !profile || !profile.email) return null;

        const myEmail = profile.email.toLowerCase().trim();
        const matchedMember = selectedCircle.members.find(m => {
            const memberEmail = (m as any).email?.toLowerCase().trim();
            // Also try matching by name/business name if email is missing (last resort)
            // Use mapped properties since 'network' object is not available in UI member type
            const memberName = m.name?.toLowerCase().trim();
            const businessName = m.category?.toLowerCase().trim();
            const myName = profile.name.toLowerCase().trim();

            return (memberEmail && memberEmail === myEmail) ||
                (memberName && memberName === myName) ||
                (businessName && businessName === myName);
        });

        return matchedMember?.id;
    }, [selectedCircle, profile]);

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

    const handleInviteMembers = async (dto: AddMemberDto) => {
        if (!selectedCircleId) return;
        try {
            await addMemberMutation.mutateAsync({
                id: selectedCircleId,
                data: dto
            });
            toast.success("Invitation sent successfully!");
        } catch (error) {
            toast.error("Failed to send invitation");
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !selectedCircleId) return;

        try {
            const payload: SendMessageDto = {
                content: chatInput,
                recipientId: chatType === 'DIRECT' ? chatMemberId || undefined : undefined
            };

            await sendMessageMutation.mutateAsync({
                id: selectedCircleId,
                data: payload
            });
            setChatInput("");
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const handleMemberAction = (action: string) => {
        if (!activeMember) return;
        if (action === "Message") {
            setChatType('DIRECT');
            setChatMemberId(activeMember.id);
            setIsChatOverlayOpen(true);
            toast.info(`Private conversation with ${activeMember.name} initiated`);
        } else {
            toast.success(`${action} for ${activeMember.name}`);
        }
    };

    const handleRemoveMember = async () => {
        if (!selectedCircleId || !activeMember) return;

        try {
            await removeMemberMutation.mutateAsync({
                id: selectedCircleId,
                memberId: activeMember.id
            });
            toast.success("Member removed from circle");
            setActiveMember(null);
        } catch (error) {
            toast.error("Failed to remove member");
        }
    };

    return (
        <div className="w-full min-h-screen bg-zinc-50/20 dark:bg-zinc-950/20 p-4 md:p-6 flex flex-col gap-6 relative">

            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-zinc-900 dark:text-zinc-50">
                        Circles Visualization
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Enterprise-grade network mapping and collaboration.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="hidden md:flex border-zinc-200" onClick={() => toast.info("Exporting graph data...")}>
                        <Share2 className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md flex-1 md:flex-none" onClick={() => {
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
                </div>
            </div>

            {/* --- Horizontal Circle Selector --- */}
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border rounded-2xl p-2 flex items-center gap-2 overflow-hidden shadow-sm">
                <div className="flex-none px-3 border-r pr-4 hidden md:block">
                    <span className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground block">Active</span>
                    <span className="text-xs font-bold text-orange-600">Circles</span>
                </div>

                <ScrollArea className="flex-1 w-full">
                    <div className="flex items-center gap-2 pb-2">
                        {isLoadingCircles ? (
                            <div className="flex gap-2 p-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-32 h-10 bg-zinc-200 animate-pulse rounded-xl" />)}
                            </div>
                        ) : circles.length === 0 ? (
                            <div className="px-4 py-2 text-xs text-muted-foreground italic">No circles yet...</div>
                        ) : circles.map((circle) => {
                            const typeDef = GROUP_CIRCLE_TYPES.find(t => t.id === circle.type);
                            const isActive = selectedCircleId === circle.id;
                            return (
                                <button
                                    key={circle.id}
                                    onClick={() => setSelectedCircleId(circle.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all whitespace-nowrap group relative min-w-[140px]",
                                        isActive
                                            ? "bg-white border-orange-500 shadow-sm ring-1 ring-orange-500"
                                            : "bg-transparent border-transparent hover:bg-white/80 hover:border-zinc-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0",
                                        typeDef?.gradient || "bg-zinc-400"
                                    )}>
                                        {typeDef?.icon && <typeDef.icon className="w-3 h-3" />}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-semibold truncate max-w-[100px]",
                                        isActive ? "text-zinc-900" : "text-muted-foreground group-hover:text-zinc-700"
                                    )}>
                                        {circle.name}
                                    </span>
                                    {isActive && (
                                        <motion.div layoutId="active-dot" className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>

                <div className="flex-none flex gap-1 pl-2 border-l ml-2">
                    {['all', 'marketing', 'finance'].map(t => (
                        <Button
                            key={t}
                            size="sm"
                            variant={activeTab === t ? "secondary" : "ghost"}
                            className={cn("h-8 text-[10px] capitalize rounded-lg px-2", activeTab === t ? "bg-orange-100 text-orange-700" : "")}
                            onClick={() => setActiveTab(t as any)}
                        >
                            {t}
                        </Button>
                    ))}
                </div>
            </div>
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

            {/* --- Main Workspace (Expanded Radar) --- */}
            <div className="flex-1 min-h-[700px] flex gap-6 relative">
                {/* The Visualization Stage (Full Width when no member selected) */}
                <div className="flex-1 relative flex flex-col">
                    <Card className="flex-1 relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-3xl shadow-xl shadow-orange-500/5">
                        {selectedCircle ? (
                            <>
                                <div className="absolute top-6 left-6 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl text-white shadow-lg", GROUP_CIRCLE_TYPES.find(t => t.id === selectedCircle.type)?.gradient || "bg-zinc-500")}>
                                            {React.createElement(GROUP_CIRCLE_TYPES.find(t => t.id === selectedCircle.type)?.icon || Zap, { className: "w-5 h-5" })}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-display font-bold text-zinc-800 dark:text-zinc-100">{selectedCircle.name}</h2>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                <Badge variant="outline" className="text-[10px] py-0 h-4 border-orange-200 text-orange-700 bg-orange-50/50">
                                                    {selectedCircle.type}
                                                </Badge>
                                                <span>•</span>
                                                <span className="font-medium">{selectedCircle.durationDays} Days Duration</span>
                                                <span>•</span>
                                                <span className="font-medium text-emerald-600">{selectedCircle.members.length} Members</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Toolbar */}
                                <div className="absolute top-6 right-6 z-10 flex gap-2">
                                    <TooltipProvider>
                                        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-1 rounded-2xl border flex gap-1 shadow-sm">
                                            <Tooltip><TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"><Search className="w-4 h-4" /></Button>
                                            </TooltipTrigger><TooltipContent>Search Graph</TooltipContent></Tooltip>

                                            <Tooltip><TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"><Filter className="w-4 h-4" /></Button>
                                            </TooltipTrigger><TooltipContent>Filter Members</TooltipContent></Tooltip>

                                            <div className="w-px h-6 bg-zinc-200 my-auto" />

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors">
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 bg-white/95 backdrop-blur-md border-orange-100 z-[10000] p-1 rounded-xl">
                                                    <DropdownMenuItem onClick={() => handleEditCircle(selectedCircle)} className="cursor-pointer hover:bg-orange-50 text-orange-700 rounded-lg">
                                                        <Settings className="w-3.5 h-3.5 mr-2" /> Circle Settings
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer text-zinc-600 rounded-lg">
                                                        <Share2 className="w-3.5 h-3.5 mr-2" /> Share Details
                                                    </DropdownMenuItem>
                                                    <Separator className="my-1" />
                                                    <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg">
                                                        <AlertCircle className="w-3.5 h-3.5 mr-2" /> Disband Circle
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TooltipProvider>
                                </div>

                                {/* The Graph Stage */}
                                <div className="flex-1 overflow-hidden relative">
                                    <div className="absolute inset-0 flex items-center justify-center p-10">
                                        <div className="w-full h-full max-w-[800px] max-h-[800px] relative">
                                            <MultiLayerRadialGraph
                                                members={selectedCircle.members}
                                                onMemberClick={setActiveMember}
                                                currentMemberId={myMemberId}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Visualization Legend */}
                                <div className="absolute bottom-6 left-6 z-10 flex gap-4">
                                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-2xl border p-3 py-2 flex items-center gap-6 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full border-2 border-orange-600 bg-orange-100" />
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Nearby</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full border-2 border-orange-400 bg-orange-50" />
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Hyperlocal</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full border-2 border-orange-200 bg-zinc-50" />
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">National</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Action Buttons (Local Context) */}
                                <div className="absolute bottom-6 right-6 z-10 flex gap-3">
                                    <Button onClick={() => setInviteOpen(true)} className="rounded-full h-12 px-6 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-lg border">
                                        <UserPlus className="w-4 h-4 mr-2" /> Invite Members
                                    </Button>
                                    <Button onClick={() => setIsChatOverlayOpen(true)} className="rounded-full h-12 w-12 bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-500/20 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 text-center">
                                <div className="w-32 h-32 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center mb-8 relative">
                                    <Globe className="w-16 h-16 text-orange-200 animate-pulse" />
                                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-200 animate-[spin_10s_linear_infinite]" />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Select an Active Circle</h3>
                                <p className="max-w-xs mt-2 text-zinc-500">Pick a circle from the selector above to visualize your collaborative network and start collaborating.</p>
                                <Button className="mt-8 bg-zinc-900 text-white rounded-xl h-11 px-8" onClick={() => setCreateOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" /> Start New Circle
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Sidebar: Member Details (Compact & Professional) */}
                <AnimatePresence>
                    {activeMember && (
                        <motion.div
                            initial={{ width: 0, opacity: 0, x: 20 }}
                            animate={{ width: 340, opacity: 1, x: 0 }}
                            exit={{ width: 0, opacity: 0, x: 20 }}
                            className="flex-none overflow-hidden h-full z-20"
                        >
                            <Card className="w-full h-full border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md">
                                <div className="h-32 bg-gradient-to-br from-orange-400 to-red-600 relative p-6 flex justify-between items-start">
                                    <Badge className="bg-white/20 backdrop-blur text-white border-white/30 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
                                        Member Node
                                    </Badge>
                                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl h-9 w-9" onClick={() => setActiveMember(null)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <CardContent className="flex-1 overflow-y-auto px-6 -mt-10 space-y-6 pb-20">
                                    <div className="space-y-4">
                                        <div className="flex items-end justify-between">
                                            <div className="w-24 h-24 rounded-3xl border-4 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 shadow-xl overflow-hidden p-1.5 animate-in zoom-in-50 duration-500">
                                                <Avatar className="w-full h-full rounded-2xl">
                                                    <AvatarImage src={activeMember.avatar} />
                                                    <AvatarFallback className="text-3xl font-black bg-orange-50 text-orange-600 uppercase">{activeMember.name[0]}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex gap-2 pb-1">
                                                <Button size="icon" variant="outline" className="rounded-xl h-10 w-10 border-zinc-100 shadow-sm"><Star className="w-4 h-4 text-zinc-300" /></Button>
                                                <Button size="icon" variant="outline" className="rounded-xl h-10 w-10 border-zinc-100 shadow-sm"><Share2 className="w-4 h-4 text-zinc-300" /></Button>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">{activeMember.name}</h2>
                                                {activeMember.status === 'active' && (
                                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                                                )}
                                            </div>
                                            <p className="text-orange-600 font-bold text-sm tracking-wide">{activeMember.category}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground block mb-2">Member Role</span>
                                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{activeMember.role}</span>
                                        </div>
                                        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground block mb-2">Network Orbit</span>
                                            <span className="font-bold text-orange-600">{ORBIT_CONFIG[activeMember.orbit]?.label || "Outer"}</span>
                                        </div>
                                    </div>

                                    {selectedCircle?.type === 'finance' && (
                                        <div className="p-5 bg-zinc-900 dark:bg-black rounded-3xl border border-zinc-800 text-white relative overflow-hidden group">
                                            <div className="absolute right-0 top-0 w-24 h-24 bg-orange-600/10 blur-3xl rounded-full" />
                                            <h4 className="font-bold text-sm flex items-center gap-2 mb-4">
                                                <Banknote className="w-4 h-4 text-orange-500" /> Financial Standing
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                                                    <span className="text-xs opacity-60">Total Contribution</span>
                                                    <span className="font-black text-sm uppercase">£{activeMember.contributions || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                                                    <span className="text-xs opacity-60">Cycle Draw</span>
                                                    <span className="font-black text-sm uppercase">{activeMember.drawDate ? new Date(activeMember.drawDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'TBD'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {myMemberId && (
                                        <div className="p-4 bg-orange-50/50 dark:bg-orange-950/10 rounded-2xl border border-orange-100 dark:border-orange-900/20 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                                                    <Wallet className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold">Your Wallet</span>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 h-8 rounded-lg font-bold text-[10px]"
                                                onClick={() => setContributionOpen(true)}
                                            >
                                                MAKE CONTRIBUTION
                                            </Button>
                                        </div>
                                    )}

                                    <div className="pt-4 flex flex-col gap-3">
                                        <Button
                                            className="w-full h-12 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2"
                                            onClick={() => handleMemberAction("Message")}
                                        >
                                            <MessageSquare className="w-4 h-4" /> Send Direct Message
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full h-12 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl font-bold"
                                            onClick={handleRemoveMember}
                                            disabled={removeMemberMutation.isPending}
                                        >
                                            {removeMemberMutation.isPending ? "Removing..." : "Remove Member"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- Floating Messaging System (Glassmorphic Overlay) --- */}
                <AnimatePresence>
                    {isChatOverlayOpen && selectedCircle && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed bottom-24 right-6 w-[400px] h-[600px] z-[100] flex flex-col pointer-events-auto"
                        >
                            <Card className="flex-1 flex flex-col border-white/20 dark:border-zinc-800 shadow-[0_32px_128px_-16px_rgba(249,115,22,0.15)] overflow-hidden rounded-[32px] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl">
                                <CardHeader className="py-4 px-6 border-b bg-gradient-to-r from-zinc-50/50 to-white/50 dark:from-zinc-900/50 dark:to-zinc-950/50 flex flex-row items-center justify-between space-y-0 flex-none backdrop-blur-md">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer group"
                                        onClick={() => {
                                            setChatType('GROUP');
                                            setChatMemberId(null);
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <CardTitle className="text-sm font-black group-hover:text-orange-600 transition-colors">
                                                {chatType === 'GROUP' ? 'Circle Broadcast' : `Direct: ${selectedCircle?.members.find(m => m.id === chatMemberId)?.name || 'Direct'}`}
                                            </CardTitle>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Live Connect</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-1">
                                        {chatType === 'DIRECT' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-zinc-100 rounded-xl"
                                                onClick={() => {
                                                    setChatType('GROUP');
                                                    setChatMemberId(null);
                                                }}
                                                title="Back to Circle"
                                            >
                                                <ArrowRight className="w-4 h-4 text-zinc-400 rotate-180" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-zinc-100 rounded-xl"
                                            onClick={() => setIsChatOverlayOpen(false)}
                                        >
                                            <X className="w-4 h-4 text-zinc-400" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <ScrollArea className="flex-1 p-6 bg-transparent">
                                    <div className="space-y-6">
                                        {isLoadingMessages ? (
                                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Syncing messages...</p>
                                            </div>
                                        ) : messagesData?.data && messagesData.data.length > 0 ? (
                                            messagesData.data
                                                .filter(msg => {
                                                    if (chatType === 'GROUP') return msg.type === 'GROUP';
                                                    return msg.type === 'DIRECT' && (msg.senderId === chatMemberId || msg.recipientId === chatMemberId);
                                                })
                                                .reverse()
                                                .map((msg, idx) => {
                                                    const isMe = msg.senderId === profile?.id;
                                                    return (
                                                        <div key={msg.id} className={cn("flex flex-col gap-1.5", isMe ? "items-end" : "items-start")}>
                                                            {!isMe && chatType === 'GROUP' && (
                                                                <span className="text-[10px] font-black uppercase text-zinc-400 ml-1">{msg.senderName}</span>
                                                            )}
                                                            <div className={cn(
                                                                "p-4 rounded-[24px] text-sm max-w-[85%] shadow-sm transition-all hover:scale-[1.02]",
                                                                isMe
                                                                    ? "bg-orange-600 text-white rounded-tr-none shadow-orange-500/20"
                                                                    : "bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 rounded-tl-none"
                                                            )}>
                                                                <p className="leading-relaxed font-medium">{msg.content}</p>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-zinc-400 mx-1 uppercase">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                        ) : (
                                            <div className="text-center py-20">
                                                <div className="w-20 h-20 bg-orange-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <MessageSquare className="w-10 h-10 text-orange-200" />
                                                </div>
                                                <h4 className="font-bold text-zinc-800 dark:text-zinc-100 italic">No Conversations Found</h4>
                                                <p className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 mt-2 px-10">Start the conversation with your network members.</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-4 px-6 border-t bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                                    <div className="flex items-center gap-3 bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-orange-600 rounded-lg"><Paperclip className="w-4 h-4" /></Button>
                                        <input
                                            className="flex-1 bg-transparent border-0 text-sm font-medium focus:outline-none h-10"
                                            placeholder={chatType === 'GROUP' ? "Post to circle..." : "Reply privately..."}
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        />
                                        <Button
                                            size="icon"
                                            className={cn(
                                                "h-10 w-10 rounded-xl transition-all shadow-lg",
                                                chatInput.trim() ? "bg-orange-600 text-white shadow-orange-500/40 hover:scale-105" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                                            )}
                                            onClick={handleSendMessage}
                                            disabled={!chatInput.trim() || sendMessageMutation.isPending}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <InviteMemberDialog
                    open={inviteOpen}
                    onOpenChange={setInviteOpen}
                    onInvite={handleInviteMembers}
                />

                {selectedCircleId && myMemberId && (
                    <ContributionDialog
                        open={contributionOpen}
                        onOpenChange={setContributionOpen}
                        circleId={selectedCircleId}
                        memberId={myMemberId}
                        defaultAmount={selectedCircle?.contributionAmount || 0}
                    />
                )}
            </div>
        </div>
    );
};
