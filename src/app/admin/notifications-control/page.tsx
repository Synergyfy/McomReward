'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Bell, Mail, MessageSquare, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { mockNotificationTemplates, mockAnnouncements, NotificationTemplate, Announcement } from '@/lib/mock-data/notifications';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddEditAnnouncementModal } from '@/components/admin/notifications-control/AddEditAnnouncementModal'; // Will create this
import { AddEditTemplateModal } from '@/components/admin/notifications-control/AddEditTemplateModal'; // Will create this

export default function NotificationsControlPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(mockNotificationTemplates);

  // State for Feedback Dialog
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackDialogProps, setFeedbackDialogProps] = useState({
    title: '',
    description: '' as React.ReactNode,
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

  // Announcement Handlers
  const handleAddEditAnnouncement = (announcement?: Announcement) => {
    setCurrentEditAnnouncement(announcement);
    setShowAddEditAnnouncementModal(true);
  };

  const handleSaveAnnouncement = (savedAnnouncement: Announcement) => {
    setShowAddEditAnnouncementModal(false);
    setTimeout(() => {
      if (savedAnnouncement.id.startsWith('new-')) {
        setAnnouncements(prev => [...prev, { ...savedAnnouncement, id: `ann-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() }]);
        handleShowFeedback("Announcement Added", `Announcement "${savedAnnouncement.title}" has been added.`);
      } else {
        setAnnouncements(prev => prev.map(ann => (ann.id === savedAnnouncement.id ? { ...savedAnnouncement, updatedAt: new Date() } : ann)));
        handleShowFeedback("Announcement Updated", `Announcement "${savedAnnouncement.title}" has been updated.`);
      }
    }, 300);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
    handleShowFeedback("Announcement Deleted", `Announcement ${announcementId} has been deleted.`);
  };

  // Template Handlers
  const handleAddEditTemplate = (template?: NotificationTemplate) => {
    setCurrentEditTemplate(template);
    setShowAddEditTemplateModal(true);
  };

  const handleSaveTemplate = (savedTemplate: NotificationTemplate) => {
    setShowAddEditTemplateModal(false);
    setTimeout(() => {
      if (savedTemplate.id.startsWith('new-')) {
        setTemplates(prev => [...prev, { ...savedTemplate, id: `temp-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() }]);
        handleShowFeedback("Template Added", `Template "${savedTemplate.name}" has been added.`);
      } else {
        setTemplates(prev => prev.map(temp => (temp.id === savedTemplate.id ? { ...savedTemplate, updatedAt: new Date() } : temp)));
        handleShowFeedback("Template Updated", `Template "${savedTemplate.name}" has been updated.`);
      }
    }, 300);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(temp => temp.id !== templateId));
    handleShowFeedback("Template Deleted", `Template ${templateId} has been deleted.`);
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automated Notifications Tab Content */}
        <TabsContent value="automated-notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Notifications Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This section will allow configuration of automated notifications based on various triggers (e.g., campaign start, expiry, user activity). (Future Enhancement)</p>
              <Button variant="outline" className="mt-4"><Bell className="mr-2 h-4 w-4" /> Configure Triggers</Button>
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