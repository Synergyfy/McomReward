# Professional Plan: Training, Support & Resource Management (Task 16)

This document outlines a professional, step-by-step approach to implement the "Training, Support & Resource Management" feature, as described in Task 16 of the Admin Full Feature Checklist, with a focus on a "glamourous," "professional," and "premium" UI.

## Phase 1: Initial Setup and Navigation

This phase establishes the foundational elements for the new feature.

1.  **Create New Page**:
    *   Create the file `src/app/admin/resources/page.tsx`. This will serve as the main entry point for the Resource Management panel.

2.  **Update Sidebar Navigation**:
    *   Add a new navigation link in `src/components/admin/sidebar/index.tsx` for "Resources" pointing to `/admin/resources`.
    *   Use an appropriate icon from `lucide-react` (e.g., `BookOpen`, `Youtube`, or `LifeBuoy`).

3.  **Define Data Models**:
    *   Create a new mock data file: `src/lib/mock-data/resources.ts`.
    *   Define TypeScript interfaces within this file:
        ```typescript
        export interface TrainingVideo {
          id: string;
          title: string;
          description: string;
          videoUrl: string;
          duration: string; // e.g., "5:30"
          targetAudience: string; // e.g., "All Businesses", "Tier: Starter"
        }

        export interface HelpArticle {
          id: string;
          title: string;
          content: string;
          category: string; // e.g., "Getting Started", "Campaigns", "Billing"
          lastUpdated: Date;
        }

        export interface LearningModule {
          id: string;
          title: string;
          description: string;
          tierLevel: string; // e.g., "Starter", "Active", "Trusted", "Partner"
          resources: (string | { type: 'video' | 'article'; id: string })[]; // Array of video/article IDs
        }
        ```

4.  **Mock Data**:
    *   Within `src/lib/mock-data/resources.ts`, create mock data arrays `mockTrainingVideos`, `mockHelpArticles`, and `mockLearningModules` populated with example data.

## Phase 2: Implementing the Resources UI

This phase focuses on building a premium user interface for managing resources.

1.  **Page Layout (`src/app/admin/resources/page.tsx`)**:
    *   Use `shadcn/ui` components for a clean and responsive design.
    *   Include a page title and description.
    *   Implement a `Tabs` component to separate different aspects of control: "Training Videos", "Help Center", and "Learning Modules".

2.  **Training Videos Tab**:
    *   **List Videos**: Display `mockTrainingVideos` in a table or card-based layout.
    *   **Add/Edit Video Modal/Form**:
        *   Create a new component, e.g., `src/components/admin/resources/AddEditVideoModal.tsx`.
        *   Fields for `title`, `description`, `videoUrl`, `duration`, `targetAudience`.
    *   **Delete Video Functionality**: A button to trigger a `ConfirmationDialog` for deleting a video.

3.  **Help Center Tab**:
    *   **List Articles**: Display `mockHelpArticles` in a table or card-based layout, with filtering by `category`.
    *   **Add/Edit Article Modal/Form**:
        *   Create a new component, e.g., `src/components/admin/resources/AddEditArticleModal.tsx`.
        *   Fields for `title`, `content` (`Textarea`), `category`.
    *   **Delete Article Functionality**: A button to trigger a `ConfirmationDialog` for deleting an article.

4.  **Learning Modules Tab**:
    *   **List Modules**: Display `mockLearningModules` in a table or card-based layout, with filtering by `tierLevel`.
    *   **Add/Edit Module Modal/Form**:
        *   Create a new component, e.g., `src/components/admin/resources/AddEditModuleModal.tsx`.
        *   Fields for `title`, `description`, `tierLevel`.
        *   A multi-select component to assign resources (videos/articles) to the module.
    *   **Delete Module Functionality**: A button to trigger a `ConfirmationDialog` for deleting a module.

## Phase 3: Functionality and State Management

This phase integrates the UI with interactive logic and data handling.

1.  **Form State Management**:
    *   Use `useState` hooks to manage the form inputs within the "Add/Edit" modals.
    *   Manage the state of all mock data arrays within `resources/page.tsx`.

2.  **CRUD Operations (Mock)**:
    *   Implement functions for adding, editing, and deleting videos, articles, and modules.
    *   Utilize the `FeedbackDialog` for success, error, and confirmation messages after each operation.

3.  **Data Persistence (Mock)**:
    *   All changes made in the UI will update the in-memory mock data. In a real application, these would be API calls to a backend.

## Phase 4: Refinements and Polish

1.  **Input Validation**:
    *   Add client-side validation for all input fields in the "Add/Edit" forms.
2.  **User Feedback**:
    *   Consistently use the `FeedbackDialog` for all user interactions.
3.  **Accessibility**:
    *   Ensure all form elements are properly labeled and accessible.
4.  **Completion Progress (Placeholder)**:
    *   Add a dedicated section or a button on the page with a message indicating that "Monitoring completion progress for businesses" is a future enhancement.

By following this structured plan, we will implement a robust, user-friendly, and visually appealing "Training, Support & Resource Management" panel that meets the requirements of Task 16.
