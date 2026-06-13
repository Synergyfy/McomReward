'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2, BookOpen, Youtube, LifeBuoy } from 'lucide-react';
import {
  mockHelpArticles,
  mockLearningModules,
  HelpArticle,
  LearningModule,
} from '@/lib/mock-data/resources';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddEditVideoModal } from '@/components/admin/resources/AddEditVideoModal';
import { AddEditArticleModal } from '@/components/admin/resources/AddEditArticleModal';
import { AddEditModuleModal } from '@/components/admin/resources/AddEditModuleModal';
import { useGetTrainingVideos, useDeleteTrainingVideo } from '@/services/training-videos/hook';
import { TrainingVideo } from '@/services/training-videos/types';

export default function ResourcesPage() {
  const { data: videoData, refetch: refetchVideos } = useGetTrainingVideos({ page: 1, limit: 100 }); // Fetch all or reasonably high limit for now
  const deleteVideoMutation = useDeleteTrainingVideo();

  const [articles, setArticles] = useState<HelpArticle[]>(mockHelpArticles);
  const [modules, setModules] = useState<LearningModule[]>(mockLearningModules);

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

  // State for Modals
  const [showAddEditVideoModal, setShowAddEditVideoModal] = useState(false);
  const [currentEditVideo, setCurrentEditVideo] = useState<TrainingVideo | undefined>(undefined);
  const [showAddEditArticleModal, setShowAddEditArticleModal] = useState(false);
  const [currentEditArticle, setCurrentEditArticle] = useState<HelpArticle | undefined>(undefined);
  const [showAddEditModuleModal, setShowAddEditModuleModal] = useState(false);
  const [currentEditModule, setCurrentEditModule] = useState<LearningModule | undefined>(undefined);

  // Handlers for Videos
  const handleAddEditVideo = (video?: TrainingVideo) => {
    setCurrentEditVideo(video);
    setShowAddEditVideoModal(true);
  };

  const handleSaveVideo = (savedVideo: TrainingVideo) => {
    // Refresh list is handled by react-query invalidation in the hook
    setShowAddEditVideoModal(false);
    // Logic for feedback is now inside the modal's success handler or we can show a generic one here if needed,
    // but the modal calls onShowFeedback already.
    // However, the modal prop 'onSave' is currently just closing the modal or local state update in the old version.
    // In the new version, the mutation is in the modal.
    // We can just rely on the modal to handle the mutation and feedback.
    // But this function is passed to the modal.
  };

  const handleDeleteVideo = (videoId: string) => {
    if (confirm("Are you sure you want to delete this video?")) {
        deleteVideoMutation.mutate(videoId, {
            onSuccess: () => {
                handleShowFeedback("Video Deleted", `Video has been deleted.`);
            },
            onError: (error: any) => {
                 handleShowFeedback("Error", error?.response?.data?.message || "Failed to delete video.");
            }
        });
    }
  };

  // Handlers for Articles
  const handleAddEditArticle = (article?: HelpArticle) => {
    setCurrentEditArticle(article);
    setShowAddEditArticleModal(true);
  };

  const handleSaveArticle = (savedArticle: HelpArticle) => {
    setShowAddEditArticleModal(false);
    setTimeout(() => {
      if (savedArticle.id.startsWith('new-')) {
        setArticles(prev => [...prev, { ...savedArticle, id: `art-${Date.now()}`, lastUpdated: new Date() }]);
        handleShowFeedback("Article Added", `Article "${savedArticle.title}" has been added.`);
      } else {
        setArticles(prev => prev.map(article => (article.id === savedArticle.id ? { ...savedArticle, lastUpdated: new Date() } : article)));
        handleShowFeedback("Article Updated", `Article "${savedArticle.title}" has been updated.`);
      }
    }, 300);
  };

  const handleDeleteArticle = (articleId: string) => {
    setArticles(prev => prev.filter(article => article.id !== articleId));
    handleShowFeedback("Article Deleted", `Article ${articleId} has been deleted.`);
  };

  // Handlers for Modules
  const handleAddEditModule = (module?: LearningModule) => {
    setCurrentEditModule(module);
    setShowAddEditModuleModal(true);
  };

  const handleSaveModule = (savedModule: LearningModule) => {
    setShowAddEditModuleModal(false);
    setTimeout(() => {
      if (savedModule.id.startsWith('new-')) {
        setModules(prev => [...prev, { ...savedModule, id: `mod-${Date.now()}` }]);
        handleShowFeedback("Module Added", `Module "${savedModule.title}" has been added.`);
      } else {
        setModules(prev => prev.map(mod => (mod.id === savedModule.id ? savedModule : mod)));
        handleShowFeedback("Module Updated", `Module "${savedModule.title}" has been updated.`);
      }
    }, 300);
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(mod => mod.id !== moduleId));
    handleShowFeedback("Module Deleted", `Module ${moduleId} has been deleted.`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-8 w-8" /> Training, Support & Resource Management
        </h1>
        <p className="text-muted-foreground">Manage help materials for users and business owners.</p>
      </div>

      <Tabs defaultValue="training-videos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="training-videos">Training Videos</TabsTrigger>
          <TabsTrigger value="help-center">Help Center</TabsTrigger>
          <TabsTrigger value="learning-modules">Learning Modules</TabsTrigger>
        </TabsList>

        {/* Training Videos Tab */}
        <TabsContent value="training-videos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><Youtube className="h-6 w-6" /> Training Videos</CardTitle>
                <Button onClick={() => handleAddEditVideo()}><PlusCircle className="mr-2 h-4 w-4" /> Add New Video</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Target Audience</TableHead>
                    {/* Duration removed from display as it's not in the new schema, or we can calculate it/fetch it if backend supports.
                        The mock had it, but the new API might not. I will remove it for now to be safe or leave blank. */}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videoData?.items.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell className="font-medium">{video.title}</TableCell>
                      <TableCell>{video.targetAudience === 'business' ? 'Business Owners' : 'Consumers'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Note: Edit requires converting mapped type to form type if they differ, but they match closely. */}
                          <Button variant="outline" size="sm" onClick={() => handleAddEditVideo(video)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteVideo(video.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!videoData?.items || videoData.items.length === 0) && (
                      <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                              No videos found.
                          </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Help Center Tab */}
        <TabsContent value="help-center">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><LifeBuoy className="h-6 w-6" /> Help Center Articles</CardTitle>
                <Button onClick={() => handleAddEditArticle()}><PlusCircle className="mr-2 h-4 w-4" /> Add New Article</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell><Badge>{article.category}</Badge></TableCell>
                      <TableCell>{article.lastUpdated.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAddEditArticle(article)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteArticle(article.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Modules Tab */}
        <TabsContent value="learning-modules">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-6 w-6" /> Learning Modules</CardTitle>
                <Button onClick={() => handleAddEditModule()}><PlusCircle className="mr-2 h-4 w-4" /> Add New Module</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Target Tier</TableHead>
                    <TableHead># of Resources</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((mod) => (
                    <TableRow key={mod.id}>
                      <TableCell className="font-medium">{mod.title}</TableCell>
                      <TableCell><Badge variant="secondary">{mod.tierLevel}</Badge></TableCell>
                      <TableCell>{mod.resources.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAddEditModule(mod)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteModule(mod.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Completion Progress Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This section will provide tools to monitor the completion progress of learning modules for businesses. (Future Enhancement)</p>
          <Button variant="outline" className="mt-4">View Progress Reports</Button>
        </CardContent>
      </Card>

      <AddEditVideoModal
        isOpen={showAddEditVideoModal}
        onClose={() => setShowAddEditVideoModal(false)}
        initialData={currentEditVideo}
        onSave={handleSaveVideo}
        onShowFeedback={handleShowFeedback}
      />

      <AddEditArticleModal
        isOpen={showAddEditArticleModal}
        onClose={() => setShowAddEditArticleModal(false)}
        initialData={currentEditArticle}
        onSave={handleSaveArticle}
        onShowFeedback={handleShowFeedback}
      />

      <AddEditModuleModal
        isOpen={showAddEditModuleModal}
        onClose={() => setShowAddEditModuleModal(false)}
        initialData={currentEditModule}
        onSave={handleSaveModule}
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
