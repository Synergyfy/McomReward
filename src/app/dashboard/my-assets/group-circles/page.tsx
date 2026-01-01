"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, ArrowRight, Check, Search, Filter,
    MessageSquare, Activity, Settings, Globe, MapPin, Zap,
    Briefcase, Share2, X, AlertCircle, Banknote,
    UserPlus, Wallet, ChevronDown, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
    useCreateGroupCircle,
    useGetGroupCircles,
    useUpdateGroupCircle,
    useRemoveGroupCircleMember,
    useGetGroupCircleMessages,
    useSendMessage,
    useAddCircleMember
} from "@/services/group-circle/hook";
import {
    CreateGroupCircleDto,
    UpdateGroupCircleDto,
    GroupCircleType,
    GroupCircleDuration,
    GroupCircleInteractionLevel,
    SendMessageDto,
    AddMemberDto
} from "@/services/group-circle/types";
import { useGetNetworkContacts } from "@/services/network-contacts/hook";
import { useGetBusinessProfile } from "@/services/business/hook";

import { MultiLayerRadialGraph, Member, OrbitLevel } from "./components/MultiLayerRadialGraph";
import { InviteMemberDialog } from "./components/InviteMemberDialog";
import { ContributionDialog } from "./ContributionDialog";
import { CircleSelector } from "./components/CircleSelector";
import { MemberSidebar } from "./components/MemberSidebar";
import { MessagingOverlay } from "./components/MessagingOverlay";

const GROUP_CIRCLE_TYPES = [
    { id: "MARKETING", name: "Marketing Circle", icon: Zap, color: "bg-blue-600", gradient: "from-blue-600 to-blue-800", mandatory: true },
    { id: "ADVERTISING", name: "Advertising Circle", icon: Globe, color: "bg-orange-600", gradient: "from-orange-600 to-red-600", mandatory: true },
    { id: "SMART_MONEY", name: "Smart Money Partner", icon: Briefcase, color: "bg-green-600", gradient: "from-green-600 to-emerald-700", mandatory: false },
    { id: "NEARBY", name: "Nearby Campaign", icon: MapPin, color: "bg-orange-500", gradient: "from-orange-500 to-amber-600", mandatory: false },
    { id: "HYPERLOCAL", name: "Hyperlocal Campaign", icon: MapPin, color: "bg-cyan-600", gradient: "from-cyan-600 to-blue-700", mandatory: false },
    { id: "NATIONAL", name: "National Campaign", icon: Globe, color: "bg-violet-600", gradient: "from-violet-600 to-purple-700", mandatory: false },
    { id: "GLOBAL", name: "Global Campaign", icon: Globe, color: "bg-indigo-600", gradient: "from-indigo-600 to-violet-700", mandatory: false },
];

export default function GroupCirclesPage() {
    const { data: circlesData, isLoading: isLoadingCircles } = useGetGroupCircles();
    const { data: networkContactsData } = useGetNetworkContacts({ limit: 100 });
    const { data: profile } = useGetBusinessProfile();

    const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
    const [circleSearch, setCircleSearch] = useState("");
    const [activeMember, setActiveMember] = useState<Member | null>(null);
    const [focusedOrbits, setFocusedOrbits] = useState<number[] | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [contributionOpen, setContributionOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [chatInput, setChatInput] = useState("");
    const [chatType, setChatType] = useState<'GROUP' | 'DIRECT'>('GROUP');
    const [chatMemberId, setChatMemberId] = useState<string | null>(null);
    const [isChatOverlayOpen, setIsChatOverlayOpen] = useState(false);
    const [createStep, setCreateStep] = useState(1);

    const [newCircleData, setNewCircleData] = useState<Partial<CreateGroupCircleDto>>({
        duration: 90,
        interactionLevel: 'READ',
        contributionAmount: 0,
        networkIds: []
    });

    const createCircleMutation = useCreateGroupCircle();
    const updateCircleMutation = useUpdateGroupCircle();
    const removeMemberMutation = useRemoveGroupCircleMember();
    const addMemberMutation = useAddCircleMember();
    const sendMessageMutation = useSendMessage();

    const { data: messagesData, isLoading: isLoadingMessages } = useGetGroupCircleMessages(
        selectedCircleId,
        {
            type: chatType,
            memberId: chatType === 'DIRECT' ? chatMemberId || undefined : undefined,
            limit: 50
        }
    );

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
                    id: m.network.id,
                    memberId: m.id,
                    name: m.network.fullName,
                    email: m.network.email,
                    role: (m.role.charAt(0).toUpperCase() + m.role.toLowerCase().slice(1)) as any,
                    orbit,
                    status: (m.network.status === 'accepted' ? 'active' : 'offline') as any,
                    category: m.network.businessName || m.network.relationshipTag || "Partner",
                    avatar: undefined,
                    contributions: Number(circle.contributionAmount),
                    drawDate: m.drawDate,
                    locationTag: m.network.locationTag ? (m.network.locationTag.charAt(0).toUpperCase() + m.network.locationTag.slice(1)) : "Unknown",
                    relationshipTag: m.network.relationshipTag ? (m.network.relationshipTag.charAt(0).toUpperCase() + m.network.relationshipTag.slice(1)) : "Network"
                } as Member;
            })
        }));
    }, [circlesData]);

    const selectedCircle = useMemo(() =>
        circles.find(c => c.id === selectedCircleId),
        [circles, selectedCircleId]);

    const myMemberId = useMemo(() => {
        if (!selectedCircle || !profile || !profile.email) return null;
        const myEmail = profile.email.toLowerCase().trim();
        const matchedMember = selectedCircle.members.find(m => {
            const memberEmail = m.email?.toLowerCase().trim();
            const memberName = m.name?.toLowerCase().trim();
            const businessName = m.category?.toLowerCase().trim();
            const myName = profile.name.toLowerCase().trim();

            return (memberEmail && memberEmail === myEmail) ||
                (memberName && memberName === myName) ||
                (businessName && businessName === myName);
        });
        return matchedMember?.id;
    }, [selectedCircle, profile]);

    const missingMandatory = useMemo(() => {
        const hasMarketing = circles.some(c => c.type.toLowerCase() === 'marketing');
        const hasAdvertising = circles.some(c => c.type.toLowerCase() === 'advertising');
        const missing = [];
        if (!hasMarketing) missing.push("Marketing Circle");
        if (!hasAdvertising) missing.push("Advertising Circle");
        return missing;
    }, [circles]);

    const handleCreateMandatory = useCallback((name: string) => {
        const typeKey = name.toLowerCase().includes("marketing") ? "MARKETING" : "ADVERTISING";
        const typeDef = GROUP_CIRCLE_TYPES.find(t => t.id === typeKey);
        if (!typeDef) return;

        setIsEditing(false);
        setNewCircleData({
            duration: 90,
            interactionLevel: 'READ',
            contributionAmount: 0,
            networkIds: [],
            type: typeDef.id as GroupCircleType
        });
        setCreateStep(2);
        setCreateOpen(true);
    }, []);

    const handleEditCircle = useCallback((circle: any) => {
        const apiCircle = circlesData?.data.find(c => c.id === circle.id);
        if (!apiCircle) return;

        setIsEditing(true);
        setNewCircleData({
            name: apiCircle.name,
            description: apiCircle.description,
            type: apiCircle.type,
            duration: apiCircle.duration as any,
            interactionLevel: apiCircle.interactionLevel,
            contributionAmount: Number(apiCircle.contributionAmount),
            networkIds: apiCircle.members.map(m => m.network.id)
        });
        setCreateStep(2);
        setCreateOpen(true);
    }, [circlesData]);

    const handleSubmitCircle = useCallback(async () => {
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
                interactionLevel: 'READ',
                contributionAmount: 0,
                networkIds: []
            });
        } catch (error) {
            toast.error(isEditing ? "Failed to update circle" : "Failed to create circle");
        }
    }, [isEditing, selectedCircleId, newCircleData, updateCircleMutation, createCircleMutation]);

    const handleInviteMembers = useCallback(async (dto: AddMemberDto) => {
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
    }, [selectedCircleId, addMemberMutation]);

    const handleSendMessage = useCallback(async () => {
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
    }, [chatInput, selectedCircleId, chatType, chatMemberId, sendMessageMutation]);

    const handleRemoveMember = useCallback(async () => {
        if (!selectedCircleId || !activeMember) return;
        try {
            await removeMemberMutation.mutateAsync({
                id: selectedCircleId,
                memberId: activeMember.memberId
            });
            toast.success("Member removed from circle");
            setActiveMember(null);
        } catch (error) {
            toast.error("Failed to remove member");
        }
    }, [selectedCircleId, activeMember, removeMemberMutation]);

    return (
        <div className="w-full min-h-screen bg-zinc-50/20 dark:bg-zinc-950/20 p-4 md:p-6 flex flex-col gap-6 relative">
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
                    <Button
                        variant="outline"
                        className="hidden md:flex border-zinc-200"
                        onClick={() => {
                            setIsEditing(false);
                            setNewCircleData({ type: 'SMART_MONEY', duration: 90, interactionLevel: 'READ', contributionAmount: 0, networkIds: [] });
                            setCreateStep(2);
                            setCreateOpen(true);
                        }}
                    >
                        <Briefcase className="w-4 h-4 mr-2" /> Create Smart Money Circle
                    </Button>
                    <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white shadow-md flex-1 md:flex-none"
                        onClick={() => {
                            setIsEditing(false);
                            setNewCircleData({ type: 'ADVERTISING', duration: 90, interactionLevel: 'READ', contributionAmount: 0, networkIds: [] });
                            setCreateStep(2);
                            setCreateOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create Circles
                    </Button>
                </div>
            </div>

            <CircleSelector
                selectedCircle={selectedCircle}
                circleSearch={circleSearch}
                setCircleSearch={setCircleSearch}
                isLoadingCircles={isLoadingCircles}
                circles={circles}
                selectedCircleId={selectedCircleId}
                setSelectedCircleId={setSelectedCircleId}
                groupCircleTypes={GROUP_CIRCLE_TYPES}
            />

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Circle Details" : "Circle Details"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Update the details for this circle." : "Fill in the details for your new circle."}
                        </DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 py-4"
                        >
                            <div className={cn("grid gap-4", newCircleData.type === 'SMART_MONEY' ? "grid-cols-2" : "grid-cols-1")}>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Circle Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Savings Group 1"
                                        value={newCircleData.name || ""}
                                        onChange={(e) => setNewCircleData({ ...newCircleData, name: e.target.value })}
                                    /><p className="text-[10px] text-muted-foreground">Give your circle a recognizable name for your partners.</p>
                                </div>
                                {newCircleData.type === 'SMART_MONEY' && (
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
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Weekly savings circle..."
                                    value={newCircleData.description || ""}
                                    onChange={(e) => setNewCircleData({ ...newCircleData, description: e.target.value })}
                                /><p className="text-[10px] text-muted-foreground">Briefly explain the purpose of this circle to its members.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
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
                                            <SelectItem value="READ"><div className="flex flex-col"><span className="font-medium">Read</span><span className="text-[10px] text-muted-foreground">Broadcast updates only; no member replies.</span></div></SelectItem>
                                            <SelectItem value="MESSAGE"><div className="flex flex-col"><span className="font-medium">Message</span><span className="text-[10px] text-muted-foreground">Enables group chat and direct messaging.</span></div></SelectItem>
                                            <SelectItem value="COLLABORATE"><div className="flex flex-col"><span className="font-medium">Collaborate</span><span className="text-[10px] text-muted-foreground">Full interaction including Smart Money tools.</span></div></SelectItem>
                                        </SelectContent>
                                    </Select><p className="text-[10px] text-muted-foreground">Define participation depth for members.</p>
                                </div>
                            </div>

                            {newCircleData.type === 'SMART_MONEY' && (
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Contribution Amount</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">Â£</span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            className="pl-7"
                                            placeholder="50"
                                            value={newCircleData.contributionAmount || ""}
                                            onChange={(e) => setNewCircleData({ ...newCircleData, contributionAmount: Number(e.target.value) })}
                                        />
                                    </div><p className="text-[10px] text-muted-foreground">The fixed amount each member contributes per round.</p>
                                </div>
                            )}

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
                                                    {contact.fullName} {contact.businessName ? `(${contact.businessName})` : ""}
                                                </Label>
                                            </div>
                                        ))}
                                        {(!networkContactsData || networkContactsData.data.length === 0) && (
                                            <p className="text-xs text-muted-foreground text-center py-4">No contacts found</p>
                                        )}
                                    </div>
                                </ScrollArea>
                                <p className="text-[10px] text-muted-foreground">Select partners from your network to join this circle initially.</p></div>
                        </motion.div>
                    </AnimatePresence>

                    <DialogFooter className="flex justify-end w-full">
                        <Button
                            onClick={handleSubmitCircle}
                            disabled={createCircleMutation.isPending || updateCircleMutation.isPending}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            {createCircleMutation.isPending || updateCircleMutation.isPending ? "Saving..." : (isEditing ? "Update Circle" : "Create Circle")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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

            <div className="flex-1 min-h-[700px] flex gap-6 relative">
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
                                                <span>â€¢</span>
                                                <span className="font-medium">{selectedCircle.durationDays} Days Duration</span>
                                                <span>â€¢</span>
                                                <span className="font-medium text-emerald-600">{selectedCircle.members.length} Members</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-6 right-6 z-10 flex gap-2">
                                    <TooltipProvider>
                                        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-1 rounded-2xl border flex gap-1 shadow-sm">
                                            <Tooltip><TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"><Search className="w-4 h-4" /></Button>
                                            </TooltipTrigger><TooltipContent>Search Graph</TooltipContent></Tooltip>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant={(focusedOrbits || relationshipFilter) ? "default" : "ghost"} className={cn("h-9 w-9 rounded-xl transition-colors", (focusedOrbits || relationshipFilter) ? "bg-orange-600 text-white hover:bg-orange-700" : "hover:bg-orange-50 hover:text-orange-600")}><Filter className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-md border-orange-100 z-[10000] p-2 rounded-xl">
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1 tracking-widest">Filter by Location</p>
                                                    <DropdownMenuItem onClick={() => setFocusedOrbits(focusedOrbits?.includes(1) ? null : [1, 2])} className={cn("cursor-pointer rounded-lg gap-2", focusedOrbits?.includes(1) && "bg-orange-50 text-orange-700")}><div className="w-2.5 h-2.5 rounded-full bg-orange-600" />Nearby</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setFocusedOrbits(focusedOrbits?.includes(3) ? null : [3, 4])} className={cn("cursor-pointer rounded-lg gap-2", focusedOrbits?.includes(3) && "bg-orange-50 text-orange-700")}><div className="w-2.5 h-2.5 rounded-full bg-orange-500" />Hyperlocal</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setFocusedOrbits(focusedOrbits?.includes(5) ? null : [5, 6])} className={cn("cursor-pointer rounded-lg gap-2", focusedOrbits?.includes(5) && "bg-orange-50 text-orange-700")}><div className="w-2.5 h-2.5 rounded-full bg-orange-400" />National</DropdownMenuItem>
                                                    {focusedOrbits && <DropdownMenuItem onClick={() => setFocusedOrbits(null)} className="cursor-pointer text-zinc-500 rounded-lg">Clear Filter</DropdownMenuItem>}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            <div className="w-px h-6 bg-zinc-200 my-auto" />

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"><Settings className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 bg-white/95 backdrop-blur-md border-orange-100 z-[10000] p-1 rounded-xl">
                                                    <DropdownMenuItem onClick={() => handleEditCircle(selectedCircle)} className="cursor-pointer hover:bg-orange-50 text-orange-700 rounded-lg"><Settings className="w-3.5 h-3.5 mr-2" /> Circle Settings</DropdownMenuItem>
                                                    <Separator className="my-1" />
                                                    <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"><AlertCircle className="w-3.5 h-3.5 mr-2" /> Disband Circle</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TooltipProvider>
                                </div>

                                <div className="flex-1 overflow-hidden relative">
                                    <div className="absolute inset-0 flex items-center justify-center p-10">
                                        <div className="w-full h-full max-w-[800px] max-h-[800px] relative">
                                            <MultiLayerRadialGraph
                                                members={selectedCircle.members}
                                                onMemberClick={setActiveMember}
                                                currentMemberId={myMemberId}
                                                focusedOrbits={focusedOrbits}
                                                relationshipFilter={relationshipFilter}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-6 right-6 z-10 flex gap-3">
                                    <Button onClick={() => setInviteOpen(true)} className="rounded-full h-12 px-6 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-lg border">
                                        <UserPlus className="w-4 h-4 mr-2" /> Invite Members
                                    </Button>
                                    <Button
                                        onClick={() => { setChatType('GROUP'); setChatMemberId(null); setIsChatOverlayOpen(true); }}
                                        className="rounded-full h-12 px-6 bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Circle Chat
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
                                <Button
                                    className="mt-8 bg-zinc-900 text-white rounded-xl h-11 px-8"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewCircleData({ type: 'ADVERTISING', duration: 90, interactionLevel: 'READ', contributionAmount: 0, networkIds: [] });
                                        setCreateStep(2);
                                        setCreateOpen(true);
                                    }}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Create Circles
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                <AnimatePresence>
                    {activeMember && (
                        <MemberSidebar
                            activeMember={activeMember}
                            onClose={() => setActiveMember(null)}
                            selectedCircle={selectedCircle}
                            myMemberId={myMemberId}
                            onSetChatType={setChatType}
                            onSetChatMemberId={setChatMemberId}
                            onSetIsChatOverlayOpen={setIsChatOverlayOpen}
                            onSetContributionOpen={setContributionOpen}
                            onRemoveMember={handleRemoveMember}
                            isRemoving={removeMemberMutation.isPending}
                        />
                    )}
                </AnimatePresence>

                <MessagingOverlay
                    selectedCircle={selectedCircle}
                    chatType={chatType}
                    chatMemberId={chatMemberId}
                    isChatOverlayOpen={isChatOverlayOpen}
                    onClose={() => setIsChatOverlayOpen(false)}
                    onSetChatType={setChatType}
                    onSetChatMemberId={setChatMemberId}
                    isLoadingMessages={isLoadingMessages}
                    messagesData={messagesData}
                    profile={profile}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    onSendMessage={handleSendMessage}
                    isSending={sendMessageMutation.isPending}
                />

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



