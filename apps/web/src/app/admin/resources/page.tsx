'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2, BookOpen, Youtube, LifeBuoy } from 'lucide-react';
import { FeedbackDialog } from '@/components/ui/feedback-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddEditVideoModal } from '@/components/admin/resources/AddEditVideoModal';
import { AddEditArticleModal } from '@/components/admin/resources/AddEditArticleModal';
import { AddEditModuleModal } from '@/components/admin/resources/AddEditModuleModal';
import { useGetTrainingVideos, useDeleteTrainingVideo } from '@/services/training-videos/hook';
import { TrainingVideo } from '@/services/training-videos/types';
import { HelpCenterArticle } from '@/services/help-center-articles/types';
import { TrainingGuide } from '@/services/training-guides/types';
import {
  useGetHelpCenterArticles,
  useDeleteHelpCenterArticle,
} from '@/services/help-center-articles/hook';
import { useGetTrainingGuides, useDeleteTrainingGuide } from '@/services/training-guides/hook';

export default function ResourcesPage() {
  const [videoPage, setVideoPage] = useState(1);
  const [articlePage, setArticlePage] = useState(1);
  const [guidePage, setGuidePage] = useState(1);
  const pageLimit = 20;
  const { data: videoData } = useGetTrainingVideos({ page: videoPage, limit: pageLimit });
  const deleteVideoMutation = useDeleteTrainingVideo();

  const { data: articlesData } = useGetHelpCenterArticles({ page: articlePage, limit: pageLimit });
  const deleteArticleMutation = useDeleteHelpCenterArticle();

  const { data: guidesData } = useGetTrainingGuides({ page: guidePage, limit: pageLimit });
  const deleteGuideMutation = useDeleteTrainingGuide();

  const videoTotal = (videoData as any)?.total ?? (videoData?.items?.length ?? 0);
  const articleTotal = (articlesData as any)?.total ?? 0;
  const guideTotal = (guidesData as any)?.total ?? 0;
  const videoTotalPages = Math.max(1, Math.ceil(videoTotal / pageLimit));
  const articleTotalPages = Math.max(1, Math.ceil(articleTotal / pageLimit));
  const guideTotalPages = Math.max(1, Math.ceil(guideTotal / pageLimit));

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
  const [currentEditArticle, setCurrentEditArticle] = useState<HelpCenterArticle | undefined>(undefined);
  const [showAddEditModuleModal, setShowAddEditModuleModal] = useState(false);
  const [currentEditModule, setCurrentEditModule] = useState<TrainingGuide | undefined>(undefined);

  // Handlers for Videos
  const handleAddEditVideo = (video?: TrainingVideo) => {
    setCurrentEditVideo(video);
    setShowAddEditVideoModal(true);
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
  const handleAddEditArticle = (article?: HelpCenterArticle) => {
    setCurrentEditArticle(article);
    setShowAddEditArticleModal(true);
  };

  const handleDeleteArticle = (articleId: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticleMutation.mutate(articleId, {
        onSuccess: () => {
          handleShowFeedback("Article Deleted", `Article has been deleted.`);
        },
        onError: (error: any) => {
          handleShowFeedback("Error", error?.response?.data?.message || "Failed to delete article.");
        }
      });
    }
  };

  // Handlers for Modules
  const handleAddEditModule = (module?: TrainingGuide) => {
    setCurrentEditModule(module);
    setShowAddEditModuleModal(true);
  };

  const handleDeleteModule = (moduleId: string) => {
    if (confirm("Are you sure you want to delete this module?")) {
      deleteGuideMutation.mutate(moduleId, {
        onSuccess: () => {
          handleShowFeedback("Module Deleted", `Module has been deleted.`);
        },
        onError: (error: any) => {
          handleShowFeedback("Error", error?.response?.data?.message || "Failed to delete module.");
        }
      });
    }
  };

  const articles = articlesData?.data ?? [];
  const guides = guidesData?.data ?? [];

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
              {videoTotal > pageLimit && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setVideoPage((p) => Math.max(1, p - 1))} disabled={videoPage <= 1}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {videoPage} of {videoTotalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setVideoPage((p) => Math.min(videoTotalPages, p + 1))} disabled={videoPage >= videoTotalPages}>
                    Next
                  </Button>
                </div>
              )}
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
                      <TableCell>{article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAddEditArticle(article)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteArticle(article.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {articles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        No articles found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {articleTotal > pageLimit && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setArticlePage((p) => Math.max(1, p - 1))} disabled={articlePage <= 1}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {articlePage} of {articleTotalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setArticlePage((p) => Math.min(articleTotalPages, p + 1))} disabled={articlePage >= articleTotalPages}>
                    Next
                  </Button>
                </div>
              )}
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
                  {guides.map((mod) => (
                    <TableRow key={mod.id}>
                      <TableCell className="font-medium">{mod.title}</TableCell>
                      <TableCell><Badge variant="secondary">{mod.targetTier?.name ?? '—'}</Badge></TableCell>
                      <TableCell>{(mod.videos?.length ?? 0) + (mod.articles?.length ?? 0)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAddEditModule(mod)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteModule(mod.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {guides.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        No learning modules found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {guideTotal > pageLimit && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setGuidePage((p) => Math.max(1, p - 1))} disabled={guidePage <= 1}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {guidePage} of {guideTotalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setGuidePage((p) => Math.min(guideTotalPages, p + 1))} disabled={guidePage >= guideTotalPages}>
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Completion Progress Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold">{videoTotal}</p>
              <p className="text-xs text-muted-foreground">Training videos published</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{articleTotal}</p>
              <p className="text-xs text-muted-foreground">Help center articles</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{guideTotal}</p>
              <p className="text-xs text-muted-foreground">Learning modules</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{videoTotal + articleTotal + guideTotal}</p>
              <p className="text-xs text-muted-foreground">Total resources live</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              const rows = [
                ['Resource Type', 'Count'],
                ['Training videos', String(videoTotal)],
                ['Help center articles', String(articleTotal)],
                ['Learning modules', String(guideTotal)],
              ];
              const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `resource-progress-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              handleShowFeedback('Progress Report', 'Resource completion snapshot downloaded as CSV.');
            }}
          >
            View Progress Reports
          </Button>
        </CardContent>
      </Card>

      <AddEditVideoModal
        isOpen={showAddEditVideoModal}
        onClose={() => setShowAddEditVideoModal(false)}
        initialData={currentEditVideo}
        onSave={() => setShowAddEditVideoModal(false)}
        onShowFeedback={handleShowFeedback}
      />

      <AddEditArticleModal
        isOpen={showAddEditArticleModal}
        onClose={() => setShowAddEditArticleModal(false)}
        initialData={currentEditArticle}
        onShowFeedback={handleShowFeedback}
      />

      <AddEditModuleModal
        isOpen={showAddEditModuleModal}
        onClose={() => setShowAddEditModuleModal(false)}
        initialData={currentEditModule}
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