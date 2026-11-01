import { useRouter } from 'next/navigation';
import { ColumnDef, Row } from '@tanstack/react-table';
import { MoreHorizontal, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BusinessUser, ConsumerUser } from '@/services/admin/types';
import Link from 'next/link';

// Define types for the action handlers
export type ActionHandlers = {
  onOpenConfirmationDialog: (
    title: string,
    description: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
  onOpenAdjustPointsModal: (
    userName: string,
    currentPoints: number,
    onAdjust: (amount: number, reason: string) => void
  ) => void;
  onOpenEditBusinessUserModal: (user: BusinessUser) => void;
  onOpenEditConsumerUserModal: (user: ConsumerUser) => void;
  onDeleteUser: (userId: string, userType: 'business' | 'consumer') => void;
  onAdjustUserPoints: (userId: string, userType: 'business' | 'consumer', amount: number, reason: string) => void;
  onSuspendUser: (userId: string, userType: 'business' | 'consumer') => void;
  onToggleSuperBusiness: (businessId: string, isSuperBusiness: boolean) => void;
  onViewDetails: (userId: string) => void; // This handler is now for navigation
  onImpersonate?: (businessId: string) => void;
};

// Reusable Action Column
const createActionColumn: <T extends BusinessUser | ConsumerUser>(
  itemType: 'business' | 'consumer',
  handlers: ActionHandlers,
  router: ReturnType<typeof useRouter>
) => ColumnDef<T> = (itemType, handlers, router) => ({
  id: 'actions',
  cell: ({ row }) => {
    const item = row.original;
    const isSuperBusiness =
      itemType === 'business' && (item as BusinessUser).isSuperBusiness === true;

    const handleAdjustPoints = (amount: number, reason: string) => {
      handlers.onAdjustUserPoints(item.id, itemType, amount, reason);
    };

    const handleSuspend = () => {
      handlers.onSuspendUser(item.id, itemType);
    };

    const handleDelete = () => {
      handlers.onDeleteUser(item.id, itemType);
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(item.id)}
          >
            Copy {itemType === 'business' ? 'Business' : 'Consumer'} ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {itemType === 'consumer' ? (
             <DropdownMenuItem
                onClick={() => handlers.onViewDetails(item.id)}
             >
                View Details
             </DropdownMenuItem>
          ) : ( // Business user actions
            <>
              <DropdownMenuItem
                onClick={() => {
                   if (handlers.onImpersonate) {
                     handlers.onImpersonate(item.id);
                   } else {
                     router.push(`/admin/users/business/${item.id}`)
                   }
                }}
              >
                View Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onViewDetails(item.id)} // This now triggers navigation
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handlers.onOpenConfirmationDialog(
                    isSuperBusiness
                      ? `Revoke Super Business from ${item.name}?`
                      : `Grant Super Business to ${item.name}?`,
                    isSuperBusiness
                      ? `${item.name} will lose Super Business access. Subscription checks, campaign limits and point limits will apply again.`
                      : `${item.name} will receive full Super Business access, including unlimited campaigns and points and no subscription checks.`,
                    () => handlers.onToggleSuperBusiness(item.id, !isSuperBusiness),
                    isSuperBusiness ? 'Revoke' : 'Grant',
                    'Cancel'
                  )
                }
                className="text-amber-700"
              >
                {isSuperBusiness ? 'Revoke Super Business' : 'Grant Super Business'}
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem
            onClick={() => {
              if (itemType === 'business') {
                handlers.onOpenEditBusinessUserModal(item as BusinessUser);
              } else {
                handlers.onOpenEditConsumerUserModal(item as ConsumerUser);
              }
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handlers.onOpenAdjustPointsModal(
                item.name,
                'pointsBalance' in item ? item.pointsBalance : item.points,
                handleAdjustPoints
              )
            }
          >
            Adjust Points
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handlers.onOpenConfirmationDialog(
                `Suspend ${item.name}?`,
                `Are you sure you want to suspend ${item.name}'s account? They will not be able to log in.`,
                handleSuspend,
                'Suspend',
                'Cancel'
              )
            }
            className="text-yellow-600"
          >
            Suspend
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              handlers.onOpenConfirmationDialog(
                `Delete ${item.name}?`,
                `Are you sure you want to permanently delete ${item.name}'s account? This action cannot be undone.`,
                handleDelete,
                'Delete',
                'Cancel'
              )
            }
          className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
});

// Columns for Business Users
export const createBusinessColumns = (handlers: ActionHandlers, router: ReturnType<typeof useRouter>): ColumnDef<BusinessUser>[] => [
  {
    accessorKey: 'name',
    header: 'Business Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium">
        <span>{row.getValue('name')}</span>
        {row.original.isSuperBusiness && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  aria-label="Super Business"
                  className="inline-flex cursor-help rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Badge
                    variant="outline"
                    className="gap-1 border-amber-200 bg-amber-50 text-amber-700"
                  >
                    <Gem className="h-3 w-3" aria-hidden="true" />
                    Super Business
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Super Business</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'tier',
    header: 'Tier',
    cell: ({ row }) => {
      const tier = row.getValue('tier') as string;
      // Add color coding for tiers later
      return <Badge variant="outline">{tier}</Badge>;
    }
  },
  {
    accessorKey: 'sector',
    header: 'Sector',
  },
  {
    accessorKey: 'referralCapacity',
    header: 'Referral Capacity',
    cell: ({ row }) => {
      return <div className="text-right font-medium">{row.getValue('referralCapacity')}</div>;
    }
  },
  {
    accessorKey: 'activityStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('activityStatus') as string;
      const variant: "default" | "secondary" | "destructive" = status === 'Active' ? 'default' : status === 'Disabled' ? 'destructive' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    }
  },
  {
    accessorKey: 'pointsBalance',
    header: 'Points Balance',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('pointsBalance'));
      const formatted = new Intl.NumberFormat('en-US').format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    }
  },
  createActionColumn<BusinessUser>('business', handlers, router),
];

// Columns for Consumer Users
export const createConsumerColumns = (handlers: ActionHandlers, router: ReturnType<typeof useRouter>): ColumnDef<ConsumerUser>[] => [
  {
    accessorKey: 'name',
    header: 'Consumer Name',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'badgeLevel',
    header: 'Badge Level',
    cell: ({ row }) => {
      const badge = row.getValue('badgeLevel') as string;
      return <Badge>{badge}</Badge>;
    }
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'activity',
    header: 'Activity',
    cell: ({ row }) => {
      const activity = row.getValue('activity') as string;
      const variant: "default" | "secondary" = activity === 'High' ? 'default' : 'secondary';
      return <Badge variant={variant}>{activity}</Badge>;
    }
  },
  {
    accessorKey: 'points',
    header: 'Points',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('points'));
      const formatted = new Intl.NumberFormat('en-US').format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    }
  },
  createActionColumn<ConsumerUser>('consumer', handlers, router),
];