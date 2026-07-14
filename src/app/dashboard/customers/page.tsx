"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Users,
  Search,
  MoreHorizontal,
  Eye,
  PlusCircle,
  Gift,
  ArrowUp,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  points: number;
  stamps: number;
  visits: number;
  lifetimeSpend: number;
  lastVisit: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah@email.com", phone: "+44 7700 123456", joined: "2025-11-03", tier: "Gold", points: 2450, stamps: 8, visits: 34, lifetimeSpend: 1820, lastVisit: "2026-07-12" },
  { id: "2", name: "Mike Peters", email: "mike@email.com", phone: "+44 7700 234567", joined: "2026-01-15", tier: "Silver", points: 890, stamps: 5, visits: 18, lifetimeSpend: 720, lastVisit: "2026-07-11" },
  { id: "3", name: "Emma Wilson", email: "emma@email.com", phone: "+44 7700 345678", joined: "2025-06-20", tier: "Platinum", points: 5200, stamps: 12, visits: 67, lifetimeSpend: 4350, lastVisit: "2026-07-13" },
  { id: "4", name: "James Brown", email: "james@email.com", phone: "+44 7700 456789", joined: "2026-03-08", tier: "Bronze", points: 320, stamps: 3, visits: 8, lifetimeSpend: 280, lastVisit: "2026-07-08" },
  { id: "5", name: "Lisa Chen", email: "lisa@email.com", phone: "+44 7700 567890", joined: "2025-09-12", tier: "Gold", points: 1870, stamps: 9, visits: 29, lifetimeSpend: 1540, lastVisit: "2026-07-10" },
  { id: "6", name: "David Kim", email: "david@email.com", phone: "+44 7700 678901", joined: "2026-02-01", tier: "Silver", points: 1120, stamps: 6, visits: 22, lifetimeSpend: 890, lastVisit: "2026-07-09" },
  { id: "7", name: "Rachel Green", email: "rachel@email.com", phone: "+44 7700 789012", joined: "2026-04-22", tier: "Bronze", points: 180, stamps: 2, visits: 5, lifetimeSpend: 150, lastVisit: "2026-07-06" },
  { id: "8", name: "Tom Harris", email: "tom@email.com", phone: "+44 7700 890123", joined: "2025-03-15", tier: "Platinum", points: 6100, stamps: 15, visits: 82, lifetimeSpend: 5200, lastVisit: "2026-07-13" },
  { id: "9", name: "Amy Clark", email: "amy@email.com", phone: "+44 7700 901234", joined: "2025-10-30", tier: "Gold", points: 2100, stamps: 10, visits: 31, lifetimeSpend: 1680, lastVisit: "2026-07-12" },
  { id: "10", name: "Chris Lee", email: "chris@email.com", phone: "+44 7700 012345", joined: "2026-05-14", tier: "Silver", points: 760, stamps: 4, visits: 15, lifetimeSpend: 620, lastVisit: "2026-07-07" },
  { id: "11", name: "Nina Patel", email: "nina@email.com", phone: "+44 7700 112233", joined: "2026-06-01", tier: "Bronze", points: 90, stamps: 1, visits: 3, lifetimeSpend: 75, lastVisit: "2026-07-05" },
  { id: "12", name: "Omar Hassan", email: "omar@email.com", phone: "+44 7700 443322", joined: "2025-08-19", tier: "Gold", points: 1950, stamps: 7, visits: 26, lifetimeSpend: 1420, lastVisit: "2026-07-11" },
];

const TIER_COLORS: Record<string, string> = {
  Bronze: "bg-orange-100 text-orange-700 border-orange-200",
  Silver: "bg-gray-100 text-gray-700 border-gray-200",
  Gold: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Platinum: "bg-slate-100 text-slate-700 border-slate-200",
};

const TIER_ORDER = ["Bronze", "Silver", "Gold", "Platinum"] as const;

const ITEMS_PER_PAGE = 8;

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Modal/sheet state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [tierDialogOpen, setTierDialogOpen] = useState(false);

  // Form state
  const [bonusPoints, setBonusPoints] = useState("");
  const [bonusReason, setBonusReason] = useState("");
  const [rewardType, setRewardType] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_CUSTOMERS.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchesTier = tierFilter === "all" || c.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [search, tierFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const total = MOCK_CUSTOMERS.length;
    const avgSpend = Math.round(MOCK_CUSTOMERS.reduce((sum, c) => sum + c.lifetimeSpend, 0) / total);
    const avgPoints = Math.round(MOCK_CUSTOMERS.reduce((sum, c) => sum + c.points, 0) / total);
    const topTier = MOCK_CUSTOMERS.filter((c) => c.tier === "Platinum").length;
    return { total, avgSpend, avgPoints, topTier };
  }, []);

  const handleViewProfile = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSheetOpen(true);
  };

  const openBonusDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setBonusPoints("");
    setBonusReason("");
    setBonusDialogOpen(true);
  };

  const openRewardDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setRewardType("");
    setRewardDialogOpen(true);
  };

  const openTierDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedTier(customer.tier);
    setTierDialogOpen(true);
  };

  const handleIssueBonus = async () => {
    if (!bonusPoints || parseInt(bonusPoints) <= 0) {
      toast.error("Please enter a valid points amount");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success(`${parseInt(bonusPoints).toLocaleString()} bonus points issued to ${selectedCustomer?.name}${bonusReason ? ` (${bonusReason})` : ""}`);
    setIsSubmitting(false);
    setBonusDialogOpen(false);
  };

  const handleSendReward = async () => {
    if (!rewardType) {
      toast.error("Please select a reward");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success(`${rewardType} reward sent to ${selectedCustomer?.name}`);
    setIsSubmitting(false);
    setRewardDialogOpen(false);
  };

  const handleUpgradeTier = async () => {
    if (!selectedTier || selectedTier === selectedCustomer?.tier) {
      toast.error("Please select a different tier");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success(`${selectedCustomer?.name} upgraded to ${selectedTier}`);
    setIsSubmitting(false);
    setTierDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">View and manage your loyalty programme members</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl"><Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" /></div>
              <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-[10px] sm:text-xs text-gray-500">Total Customers</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /></div>
              <div><p className="text-lg sm:text-2xl font-bold text-gray-900">£{stats.avgSpend}</p><p className="text-[10px] sm:text-xs text-gray-500">Avg. Spend</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl"><Star className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /></div>
              <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.avgPoints.toLocaleString()}</p><p className="text-[10px] sm:text-xs text-gray-500">Avg. Points</p></div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl"><ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" /></div>
              <div><p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.topTier}</p><p className="text-[10px] sm:text-xs text-gray-500">Platinum Members</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 text-sm" />
              </div>
              <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px] text-sm">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Customers ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead className="text-right">Stamps</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Lifetime Spend</TableHead>
                    <TableHead className="text-right">Last Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <button onClick={() => handleViewProfile(customer)} className="text-left">
                          <p className="font-medium text-gray-900 text-sm hover:text-orange-600 transition-colors">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs font-medium ${TIER_COLORS[customer.tier]}`}>{customer.tier}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">{customer.points.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm">{customer.stamps}</TableCell>
                      <TableCell className="text-right text-sm">{customer.visits}</TableCell>
                      <TableCell className="text-right font-medium text-sm">£{customer.lifetimeSpend.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm text-gray-500">
                        {new Date(customer.lastVisit).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </TableCell>
                      <TableCell className="text-right">
                        <CustomerActions
                          customer={customer}
                          onViewProfile={() => handleViewProfile(customer)}
                          onIssueBonus={() => openBonusDialog(customer)}
                          onSendReward={() => openRewardDialog(customer)}
                          onUpgradeTier={() => openTierDialog(customer)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-gray-500 text-sm">No customers found.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {paginated.map((customer) => (
                <div key={customer.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <button onClick={() => handleViewProfile(customer)} className="text-left">
                        <p className="font-medium text-gray-900 text-sm hover:text-orange-600 transition-colors">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </button>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-medium ${TIER_COLORS[customer.tier]}`}>{customer.tier}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Points</p>
                      <p className="font-bold text-sm text-gray-900">{customer.points.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Visits</p>
                      <p className="font-bold text-sm text-gray-900">{customer.visits}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500">Spend</p>
                      <p className="font-bold text-sm text-gray-900">£{customer.lifetimeSpend.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                      Last visit: {new Date(customer.lastVisit).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                    <CustomerActions
                      customer={customer}
                      onViewProfile={() => handleViewProfile(customer)}
                      onIssueBonus={() => openBonusDialog(customer)}
                      onSendReward={() => openRewardDialog(customer)}
                      onUpgradeTier={() => openTierDialog(customer)}
                    />
                  </div>
                </div>
              ))}
              {paginated.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No customers found.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 sm:p-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-xs h-8">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-xs h-8">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── VIEW PROFILE SHEET ─────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedCustomer && (
            <>
              <SheetHeader className="pb-4 border-b border-gray-100">
                <SheetTitle className="text-xl">Customer Profile</SheetTitle>
                <SheetDescription>Detailed view of {selectedCustomer.name}</SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedCustomer.name}</h3>
                    <Badge variant="outline" className={`mt-1 text-xs font-medium ${TIER_COLORS[selectedCustomer.tier]}`}>{selectedCustomer.tier}</Badge>
                  </div>
                </div>

                {/* Contact Info */}
                <Card className="border border-gray-100">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">Joined {new Date(selectedCustomer.joined).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border border-gray-100 bg-orange-50/30">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-gray-500">Points</p>
                      <p className="text-xl font-bold text-gray-900">{selectedCustomer.points.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-100 bg-green-50/30">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-gray-500">Lifetime Spend</p>
                      <p className="text-xl font-bold text-gray-900">£{selectedCustomer.lifetimeSpend.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-100 bg-blue-50/30">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-gray-500">Visits</p>
                      <p className="text-xl font-bold text-gray-900">{selectedCustomer.visits}</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-100 bg-purple-50/30">
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-gray-500">Stamps</p>
                      <p className="text-xl font-bold text-gray-900">{selectedCustomer.stamps}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Tier Progress */}
                <Card className="border border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900">Tier Progress</p>
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                    </div>
                    <Progress value={selectedCustomer.points > 5000 ? 100 : (selectedCustomer.points / 5000) * 100} className="h-2" />
                    <p className="text-xs text-gray-500 mt-2">{selectedCustomer.points.toLocaleString()} / 5,000 points to Platinum</p>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setSheetOpen(false); openBonusDialog(selectedCustomer); }} className="gap-2 text-xs border-orange-200 text-orange-600 hover:bg-orange-50">
                      <PlusCircle className="w-3.5 h-3.5" /> Issue Points
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSheetOpen(false); openRewardDialog(selectedCustomer); }} className="gap-2 text-xs border-orange-200 text-orange-600 hover:bg-orange-50">
                      <Gift className="w-3.5 h-3.5" /> Send Reward
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSheetOpen(false); openTierDialog(selectedCustomer); }} className="gap-2 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 col-span-2">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Upgrade Tier
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── ISSUE BONUS POINTS DIALOG ──────────────────────────────────── */}
      <Dialog open={bonusDialogOpen} onOpenChange={setBonusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PlusCircle className="w-5 h-5 text-orange-500" /> Issue Bonus Points</DialogTitle>
            <DialogDescription>Add bonus points to {selectedCustomer?.name}'s account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Points Amount</Label>
              <Input type="number" min={1} placeholder="e.g. 500" value={bonusPoints} onChange={(e) => setBonusPoints(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <Input placeholder="e.g. Customer appreciation" value={bonusReason} onChange={(e) => setBonusReason(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBonusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleIssueBonus} disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Issuing...</> : <><CheckCircle className="w-4 h-4" /> Issue Points</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── SEND REWARD DIALOG ─────────────────────────────────────────── */}
      <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="w-5 h-5 text-orange-500" /> Send Reward</DialogTitle>
            <DialogDescription>Choose a reward to send to {selectedCustomer?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Reward Type</Label>
              <Select value={rewardType} onValueChange={setRewardType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a reward..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free Coffee">Free Coffee</SelectItem>
                  <SelectItem value="10% Off Voucher">10% Off Voucher</SelectItem>
                  <SelectItem value="£5 Credit">£5 Credit</SelectItem>
                  <SelectItem value="Free Dessert">Free Dessert</SelectItem>
                  <SelectItem value="Double Points Day">Double Points Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {rewardType && (
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-3 flex items-center gap-3">
                  <Gift className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{rewardType}</p>
                    <p className="text-xs text-gray-500">Will be sent to {selectedCustomer?.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRewardDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendReward} disabled={isSubmitting || !rewardType} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><CheckCircle className="w-4 h-4" /> Send Reward</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── UPGRADE TIER DIALOG ────────────────────────────────────────── */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ArrowUp className="w-5 h-5 text-orange-500" /> Upgrade Tier</DialogTitle>
            <DialogDescription>Change tier for {selectedCustomer?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedCustomer && (
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Current</p>
                  <Badge variant="outline" className={`text-sm font-semibold px-4 py-2 ${TIER_COLORS[selectedCustomer.tier]}`}>{selectedCustomer.tier}</Badge>
                </div>
                <ArrowUpRight className="w-6 h-6 text-gray-400" />
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">New</p>
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIER_ORDER.map((t) => (
                        <SelectItem key={t} value={t} disabled={t === selectedCustomer.tier}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {selectedTier && selectedCustomer && selectedTier !== selectedCustomer.tier && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-3 text-center">
                  <p className="text-sm font-semibold text-green-700">
                    {selectedCustomer.name} will be upgraded to {selectedTier}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTierDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpgradeTier} disabled={isSubmitting || !selectedTier || selectedTier === selectedCustomer?.tier} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Upgrading...</> : <><CheckCircle className="w-4 h-4" /> Confirm Upgrade</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ROW ACTIONS DROPDOWN ───────────────────────────────────────────────────

function CustomerActions({
  customer,
  onViewProfile,
  onIssueBonus,
  onSendReward,
  onUpgradeTier,
}: {
  customer: Customer;
  onViewProfile: () => void;
  onIssueBonus: () => void;
  onSendReward: () => void;
  onUpgradeTier: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onViewProfile} className="gap-2 text-sm cursor-pointer">
          <Eye className="w-4 h-4" /> View Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onIssueBonus} className="gap-2 text-sm cursor-pointer">
          <PlusCircle className="w-4 h-4" /> Issue Bonus Points
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSendReward} className="gap-2 text-sm cursor-pointer">
          <Gift className="w-4 h-4" /> Send Reward
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUpgradeTier} className="gap-2 text-sm cursor-pointer">
          <ArrowUp className="w-4 h-4" /> Upgrade Tier
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
