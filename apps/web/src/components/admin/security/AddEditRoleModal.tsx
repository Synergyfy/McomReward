'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Role, CreateRoleDto } from '@/services/security/types';
import { useGetPermissions, useCreateRole, useUpdateRole } from '@/services/security/hook';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';

interface AddEditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Role;
  onShowFeedback: (title: string, description: React.ReactNode, actionText?: string) => void;
}

export function AddEditRoleModal({
  isOpen,
  onClose,
  initialData,
  onShowFeedback,
}: AddEditRoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: permissions = [] } = useGetPermissions();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const isPending = createRoleMutation.isPending || updateRoleMutation.isPending;

  // State for Feedback Dialog (local to modal for validation errors)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState<{
    title: string;
    description: React.ReactNode;
    actionText: string;
  }>({
    title: '',
    description: '',
    actionText: 'OK',
  });

  const handleShowLocalFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setSelectedPermissions(initialData.permissions);
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions([]);
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push('Role Name is required.');
    }
    if (selectedPermissions.length === 0) {
      errors.push('At least one permission must be selected.');
    }

    if (errors.length > 0) {
      handleShowLocalFeedback(
        "Validation Error",
        <ul className="list-disc pl-5">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      );
      return;
    }

    const payload: CreateRoleDto = {
      name: name.trim(),
      description,
      permissionIds: selectedPermissions,
    };

    const onSuccess = () => {
      onClose();
      onShowFeedback("Success", `Role "${name}" has been saved successfully.`);
    };

    const onError = (error: any) => {
      handleShowLocalFeedback("Error", error?.response?.data?.message || "Failed to save role.");
    };

    if (initialData) {
      updateRoleMutation.mutate({ id: initialData.id, ...payload }, { onSuccess, onError });
    } else {
      createRoleMutation.mutate(payload, { onSuccess, onError });
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const dialogTitle = initialData ? `Edit Role: ${initialData.name}` : 'Create New Role';
  const dialogDescription = initialData ? 'Modify the details of this role.' : 'Enter the details for a new role.';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Role Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>

          {/* Permissions */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Permissions</Label>
            <div className="col-span-3 space-y-2">
              {permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No permissions defined yet.</p>
              ) : (
                permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                    />
                    <label
                      htmlFor={permission.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save Role'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </Dialog>
  );
}