import { useRouter } from 'next/navigation';
import { ColumnDef, Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
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
import { BusinessUser, ConsumerUser } from '@/lib/mock-data/users';

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
  onOpenViewUserDetailsModal: (user: BusinessUser | ConsumerUser) => void;
  onDeleteUser: (userId: string, userType: 'business' | 'consumer') => void; // New handler
  onAdjustUserPoints: (userId: string, userType: 'business' | 'consumer', amount: number, reason: string) => void; // New handler
  onSuspendUser: (userId: string, userType: 'business' | 'consumer') => void; // New handler
};

const ActionsCell = <T extends BusinessUser | ConsumerUser>({
  row,
  itemType,
  handlers,
}: {
  row: Row<T>;
  itemType: 'business' | 'consumer';
  handlers: ActionHandlers;
}) => {
  const router = useRouter(); // Initialize useRouter
  const item = row.original;

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
        {itemType === 'business' && ( // Only show "View Dashboard" for business users
          <DropdownMenuItem
            onClick={() => router.push(`/admin/view-business/${item.id}`)}
          >
            View Dashboard
          </DropdownMenuItem>
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
};

// Reusable Action Column
const createActionColumn: <T extends BusinessUser | ConsumerUser>(
  itemType: 'business' | 'consumer',
  handlers: ActionHandlers
) => ColumnDef<T> = (itemType, handlers) => ({
  id: 'actions',
  cell: ({ row }) => (
    <ActionsCell row={row} itemType={itemType} handlers={handlers} />
  ),
});

// Columns for Business Users
export const createBusinessColumns = (handlers: ActionHandlers): ColumnDef<BusinessUser>[] => [
  {
    accessorKey: 'name',
    header: 'Business Name',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
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
    accessorKey: 'activityStatus',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.getValue('activityStatus') as string;
        const variant: "default" | "secondary" | "destructive" = status === 'Active' ? 'default' : status === 'Suspended' ? 'destructive' : 'secondary';
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
  createActionColumn<BusinessUser>('business', handlers),
];

// Columns for Consumer Users
export const createConsumerColumns = (handlers: ActionHandlers): ColumnDef<ConsumerUser>[] => [
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
  createActionColumn<ConsumerUser>('consumer', handlers),
];