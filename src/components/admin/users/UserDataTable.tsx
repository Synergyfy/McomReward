'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationDialog } from './ConfirmationDialog';
import { AdjustPointsModal } from './AdjustPointsModal';
import { EditBusinessUserModal } from './EditBusinessUserModal';
import { EditConsumerUserModal } from './EditConsumerUserModal';
import { ViewUserDetailsModal } from './ViewUserDetailsModal';
import { BusinessUser, ConsumerUser } from '@/lib/mock-data/users';
import { ActionHandlers } from './columns'; // Import ActionHandlers type

interface DataTableProps<TData, TValue> {
  columns: (handlers: ActionHandlers) => ColumnDef<TData, TValue>[]; // Updated signature
  data: TData[];
  onUpdateUser: (updatedUser: BusinessUser | ConsumerUser) => void;
  onDeleteUser: (userId: string, userType: 'business' | 'consumer') => void;
  onAdjustUserPoints: (userId: string, userType: 'business' | 'consumer', amount: number, reason: string) => void;
  onSuspendUser: (userId: string, userType: 'business' | 'consumer') => void;
}

export function UserDataTable<TData extends BusinessUser | ConsumerUser, TValue>({
  columns,
  data,
  onUpdateUser,
  onDeleteUser,
  onAdjustUserPoints,
  onSuspendUser,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // State for Confirmation Dialog
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);
  const [confirmationDialogProps, setConfirmationDialogProps] = React.useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    title: '',
    description: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  });

  // State for Adjust Points Modal
  const [showAdjustPointsModal, setShowAdjustPointsModal] = React.useState(false);
  const [adjustPointsModalProps, setAdjustPointsModalProps] = React.useState({
    userName: '',
    currentPoints: 0,
    onAdjust: (amount: number, reason: string) => {},
  });

  // State for Edit Modals
  const [showEditBusinessUserModal, setShowEditBusinessUserModal] = React.useState(false);
  const [showEditConsumerUserModal, setShowEditConsumerUserModal] = React.useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = React.useState<BusinessUser | ConsumerUser | null>(null);

  // State for View Details Modal
  const [showViewUserDetailsModal, setShowViewUserDetailsModal] = React.useState(false);
  const [selectedUserForView, setSelectedUserForView] = React.useState<BusinessUser | ConsumerUser | null>(null);


  const handleCloseModals = () => {
    setShowConfirmationDialog(false);
    setShowAdjustPointsModal(false);
    setShowEditBusinessUserModal(false);
    setShowEditConsumerUserModal(false);
    setShowViewUserDetailsModal(false);
    setSelectedUserForEdit(null);
    setSelectedUserForView(null);
  };

  const handleOpenConfirmationDialog = (
    title: string,
    description: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setConfirmationDialogProps({ title, description, onConfirm, confirmText, cancelText });
    setShowConfirmationDialog(true);
  };

  const handleOpenAdjustPointsModal = (
    userName: string,
    currentPoints: number,
    onAdjust: (amount: number, reason: string) => void
  ) => {
    setAdjustPointsModalProps({ userName, currentPoints, onAdjust });
    setShowAdjustPointsModal(true);
  };

  const handleOpenEditBusinessUserModal = (user: BusinessUser) => {
    setSelectedUserForEdit(user);
    setShowEditBusinessUserModal(true);
  };

  const handleOpenEditConsumerUserModal = (user: ConsumerUser) => {
    setSelectedUserForEdit(user);
    setShowEditConsumerUserModal(true);
  };

  const handleOpenViewUserDetailsModal = (user: BusinessUser | ConsumerUser) => {
    setSelectedUserForView(user);
    setShowViewUserDetailsModal(true);
  };

  const handleSaveBusinessUser = (updatedUser: BusinessUser) => {
    onUpdateUser(updatedUser); // Propagate update to parent
    handleCloseModals();
  };

  const handleSaveConsumerUser = (updatedUser: ConsumerUser) => {
    onUpdateUser(updatedUser); // Propagate update to parent
    handleCloseModals();
  };


  // Define the actual columns using the handler functions
  const tableColumns = React.useMemo(() => {
    const handlers: ActionHandlers = {
      onOpenConfirmationDialog: handleOpenConfirmationDialog,
      onOpenAdjustPointsModal: handleOpenAdjustPointsModal,
      onOpenEditBusinessUserModal: handleOpenEditBusinessUserModal,
      onOpenEditConsumerUserModal: handleOpenEditConsumerUserModal,
      onOpenViewUserDetailsModal: handleOpenViewUserDetailsModal,
      onDeleteUser: onDeleteUser,
      onAdjustUserPoints: onAdjustUserPoints,
      onSuspendUser: onSuspendUser,
    };
    return columns(handlers); // Pass the single handlers object
  }, [
    columns,
    handleOpenConfirmationDialog,
    handleOpenAdjustPointsModal,
    handleOpenEditBusinessUserModal,
    handleOpenEditConsumerUserModal,
    handleOpenViewUserDetailsModal,
    onDeleteUser,
    onAdjustUserPoints,
    onSuspendUser,
  ]);


  const table = useReactTable({
    data,
    columns: tableColumns, // Use the dynamically created columns
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('email')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Modals */}
      <ConfirmationDialog
        isOpen={showConfirmationDialog}
        onClose={handleCloseModals}
        {...confirmationDialogProps}
      />
      <AdjustPointsModal
        isOpen={showAdjustPointsModal}
        onClose={handleCloseModals}
        {...adjustPointsModalProps}
      />
      {selectedUserForEdit && showEditBusinessUserModal && (
        <EditBusinessUserModal
          isOpen={showEditBusinessUserModal}
          onClose={handleCloseModals}
          onSave={handleSaveBusinessUser}
          user={selectedUserForEdit as BusinessUser}
        />
      )}
      {selectedUserForEdit && showEditConsumerUserModal && (
        <EditConsumerUserModal
          isOpen={showEditConsumerUserModal}
          onClose={handleCloseModals}
          onSave={handleSaveConsumerUser}
          user={selectedUserForEdit as ConsumerUser}
        />
      )}
      {selectedUserForView && showViewUserDetailsModal && (
        <ViewUserDetailsModal
          isOpen={showViewUserDetailsModal}
          onClose={handleCloseModals}
          user={selectedUserForView}
        />
      )}
    </div>
  );
}