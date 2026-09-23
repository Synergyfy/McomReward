'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Bell, Edit, Trash2, Loader2 } from 'lucide-react';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddEditAnnouncementModal } from '@/components/admin/notifications-control/AddEditAnnouncementModal';
import { AddEditTemplateModal } from '@/components/admin/notifications-control/AddEditTemplateModal';
import { Announcement, NotificationTemplate, CreateAnnouncementDto, CreateNotificationTemplateDto } from '@/services/notifications/admin-types';
import {
  useGetAdminAnnouncements,
  useCreateAdminAnnouncement,
  useUpdateAdminAnnouncement,
  useDeleteAdminAnnouncement,
  useGetAdminNotificationTemplates,
  useCreateAdminNotificationTemplate,
  useUpdateAdminNotificationTemplate,
  useDeleteAdminNotificationTemplate,
} from '@/services/notifications/admin-hook';

const TRIGGER_STORAGE_KEY = 'admin-automated-triggers';
const DEFAULT_TRIGGERS = [
  { id: 'campaign-start', label: 'Campaign started', description: 'Notify participants when a campaign goes live.', enabled: true },
  { id: 'campaign-expiry', label: 'Campaign expiring soon', description: 'Remind participants 48h before a campaign ends.', enabled: true },
  { id: 'reward-redeemed', label: 'Reward redeemed', description: 'Confirm each successful reward redemption.', enabled: true },
  { id: 'points-low', label: 'Low points balance', description: 'Alert businesses when monthly points run low.', enabled: false },
  { id: 'new-business', label: 'New business onboarded', description: 'Notify admins when a business joins.', enabled: false },
];

function loadTriggers() {
  if (typeof window === 'undefined') return DEFAULT_TRIGGERS;
  try {
    const raw = localStorage.getItem(TRIGGER_STORAGE_KEY);
    if (!raw) return DEFAULT_TRIGGERS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TRIGGERS;
    return DEFAULT_TRIGGERS.map((d) => ({ ...d, ...(parsed.find((p: any) => p.id === d.id) ?? {}) }));
  } catch {
    return DEFAULT_TRIGGERS;
  }
}

export default function NotificationsControlPage() {
  const [annPage, setAnnPage] = useState(1);
  const [tplPage, setTplPage] = useState(1);
  const pageLimit = 20;
  const { data: announcementsData, isLoading: isLoadingAnnouncements } = useGetAdminAnnouncements({ page: annPage, limit: pageLimit });
  const { data: templatesData, isLoading: isLoadingTemplates } = useGetAdminNotificationTemplates({ page: tplPage, limit: pageLimit });
  const [triggers, setTriggers] = useState(DEFAULT_TRIGGERS);
  React.useEffect(() => {
    setTriggers(loadTriggers());
  }, []);
  const toggleTrigger = (id: string) => {
    setTriggers((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t));
      try {
        localStorage.setItem(TRIGGER_STORAGE_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };
  const annTotalPages = Math.max(1, Math.ceil((announcementsData?.total ?? 0) / pageLimit));
  const tplTotal = templatesData?.total ?? 0;
  const emailTplTotalPages = Math.max(1, Math.ceil(tplTotal / pageLimit));

  const createAnnouncementMutation = useCreateAdminAnnouncement();
  const updateAnnouncementMutation = useUpdateAdminAnnouncement();
  const deleteAnnouncementMutation = useDeleteAdminAnnouncement();

  const createTemplateMutation = useCreateAdminNotificationTemplate();
  const updateTemplateMutation = useUpdateAdminNotificationTemplate();
  const deleteTemplateMutation = useDeleteAdminNotificationTemplate();

  // State for Feedback Dialog
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

  const handleShowFeedback = (title: string, description: React.ReactNode, actionText?: string) => {
    setFeedbackDialogProps({ title, description, actionText: actionText || 'OK' });
    setShowFeedbackDialog(true);
  };

  // State for Add/Edit Announcement Modal
  const [showAddEditAnnouncementModal, setShowAddEditAnnouncementModal] = useState(false);
  const [currentEditAnnouncement, setCurrentEditAnnouncement] = useState<Announcement | undefined>(undefined);

  // State for Add/Edit Template Modal
  const [showAddEditTemplateModal, setShowAddEditTemplateModal] = useState(false);
  const [currentEditTemplate, setCurrentEditTemplate] = useState<NotificationTemplate | undefined>(undefined);

  const announcements = announcementsData?.data ?? [];
  const templates = templatesData?.data ?? [];

  // Announcement Handlers
  const handleAddEditAnnouncement = (announcement?: Announcement) => {
    setCurrentEditAnnouncement(announcement);
    setShowAddEditAnnouncementModal(true);
  };

  const handleSaveAnnouncement = (dto: CreateAnnouncementDto) => {
    if (currentEditAnnouncement) {
      updateAnnouncementMutation.mutate(
        { id: currentEditAnnouncement.id, ...dto },
        {
          onSuccess: () => {
            handleShowFeedback("Announcement Updated", `Announcement "${dto.title}" has been updated.`);
          },
          onError: (error: any) => {
            handleShowFeedback("Error", error?.response?.data?.message || "Failed to update announcement.");
          },
        }
      );
    } else {
      createAnnouncementMutation.mutate(dto, {
        onSuccess: () => {
          handleShowFeedback("Announcement Added", `Announcement "${dto.title}" has been added.`);
        },
        onError: (error: any) => {
          handleShowFeedback("Error", error?.response?.data?.message || "Failed to create announcement.");
        },
      });
    }
    setShowAddEditAnnouncementModal(false);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncementMutation.mutate(announcementId, {
        onSuccess: () => {
          handleShowFeedback("Announcement Deleted", `Announcement has been deleted.`);
        },
        onError: (error: any) => {
          handleShowFeedback("Error", error?.response?.data?.message || "Failed to delete announcement.");
        },
      });
    }
  };

  // Template Handlers
  const handleAddEditTemplate = (template?: NotificationTemplate) => {
    setCurrentEditTemplate(template);
    setShowAddEditTemplateModal(true);
  };

  const handleSaveTemplate = (dto: CreateNotificationTemplateDto) => {
    if (currentEditTemplate) {
      updateTemplateMutation.mutate(
        { id: currentEditTemplate.id, ...dto },
        {
          onSuccess: () => {
            handleShowFeedback("Template Updated", `Template "${dto.name}" has been updated.`);
          },
          onError: (error: any) => {
            handleShowFeedback("Error", error?.response?.data?.message || "Failed to update template.");
          },
        }
      );
    } else {
      createTemplateMutation.mutate(dto, {
        onSuccess: () => {
          handleShowFeedback("Template Added", `Template "${dto.name}" has been added.`);
        },
        onError: (error: any) => {
          handleShowFeedback("Error", error?.response?.data?.message || "Failed to create template.");
        },
      });
    }
    setShowAddEditTemplateModal(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(templateId, {
        onSuccess: () => {
          handleShowFeedback("Template Deleted", `Template has been deleted.`);
        },
        onError: (error: any) => {
          handleShowFeedback("Error", error?.response?.data?.message || "Failed to delete template.");
        },
      });
    }
  };

  const getStatusBadgeVariant = (status: Announcement['status'] | NotificationTemplate['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': return 'outline';
      case 'expired': return 'destructive';
      case 'archived': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications & Communication Control</h1>
        <p className="text-muted-foreground">Manage how alerts, announcements, and emails are delivered to users.</p>
      </div>

      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="email-templates">Email Templates</TabsTrigger>
          <TabsTrigger value="automated-notifications">Automated Notifications</TabsTrigger>
        </TabsList>

        {/* Announcements Tab Content */}
        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Platform Announcements</CardTitle>
                <Button onClick={() => handleAddEditAnnouncement()}><PlusCircle className="mr-2 h-4 w-4" /> Create New Announcement</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAnnouncements ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Target Audience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No announcements found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      announcements.map((ann) => (
                        <TableRow key={ann.id}>
                          <TableCell className="font-medium">{ann.title}</TableCell>
                          <TableCell>{ann.targetAudience}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(ann.status)}>{ann.status}</Badge>
                          </TableCell>
                          <TableCell>{ann.startDate.toLocaleDateString()} - {ann.endDate.toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleAddEditAnnouncement(ann)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteAnnouncement(ann.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
              {(announcementsData?.total ?? 0) > pageLimit && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setAnnPage((p) => Math.max(1, p - 1))} disabled={annPage <= 1}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {annPage} of {annTotalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setAnnPage((p) => Math.min(annTotalPages, p + 1))} disabled={annPage >= annTotalPages}>
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates Tab Content */}
        <TabsContent value="email-templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Email Templates Manager</CardTitle>
                <Button onClick={() => handleAddEditTemplate()}><PlusCircle className="mr-2 h-4 w-4" /> Create New Template</Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTemplates ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target Audience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.filter(t => t.type === 'email').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No email templates found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      templates.filter(t => t.type === 'email').map((temp) => (
                        <TableRow key={temp.id}>
                          <TableCell className="font-medium">{temp.name}</TableCell>
                          <TableCell>{temp.subject}</TableCell>
                          <TableCell>{temp.type}</TableCell>
                          <TableCell>{temp.targetAudience}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(temp.status)}>{temp.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleAddEditTemplate(temp)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(temp.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
              {tplTotal > pageLimit && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setTplPage((p) => Math.max(1, p - 1))} disabled={tplPage <= 1}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {tplPage} of {emailTplTotalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setTplPage((p) => Math.min(emailTplTotalPages, p + 1))} disabled={tplPage >= emailTplTotalPages}>
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automated Notifications Tab Content */}
        <TabsContent value="automated-notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Automated Notifications Configuration</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleShowFeedback(
                      'Triggers Saved',
                      `${triggers.filter((t) => t.enabled).length} of ${triggers.length} automated triggers are enabled.`,
                    );
                  }}
                >
                  <Bell className="mr-2 h-4 w-4" /> Save Configuration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {triggers.map((trigger) => (
                    <TableRow key={trigger.id}>
                      <TableCell className="font-medium">{trigger.label}</TableCell>
                      <TableCell className="text-muted-foreground">{trigger.description}</TableCell>
                      <TableCell>
                        <Badge variant={trigger.enabled ? 'default' : 'outline'}>
                          {trigger.enabled ? 'enabled' : 'disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={trigger.enabled ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleTrigger(trigger.id)}
                        >
                          {trigger.enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-3">
                Trigger preferences are stored per admin browser and applied when dispatching notifications.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddEditAnnouncementModal
        isOpen={showAddEditAnnouncementModal}
        onClose={() => setShowAddEditAnnouncementModal(false)}
        initialData={currentEditAnnouncement}
        onSave={handleSaveAnnouncement}
        onShowFeedback={handleShowFeedback}
      />

      <AddEditTemplateModal
        isOpen={showAddEditTemplateModal}
        onClose={() => setShowAddEditTemplateModal(false)}
        initialData={currentEditTemplate}
        onSave={handleSaveTemplate}
        onShowFeedback={handleShowFeedback}
      />

      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        {...feedbackDialogProps}
      />
    </div>
  );
}