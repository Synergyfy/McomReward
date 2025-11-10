# Reporting & Analytics Implementation Plan (Prototype with Mock Data)

## Task 11: REPORTING & ANALYTICS
**Purpose:** Monitor the platform’s performance and ensure business owners achieve goals.

## High-Level Approach
This implementation will focus solely on frontend (UI) development using mock data to simulate backend responses.
1.  **Mock Data Generation:** Create static JSON files or JavaScript objects to represent the data for each report.
2.  **Frontend:** Develop new components or integrate into existing admin dashboard components to display the reports. Implement data visualization (charts/graphs) and client-side download functionalities (CSV, PDF, XLS).

## Detailed Plan for Each Report

### 1. Total Campaigns Created, Joined, Claimed
*   **Mock Data Source:** A JSON object or JS variable containing counts for created, joined, and claimed campaigns.
    ```json
    {
      "totalCreated": 120,
      "totalJoined": 850,
      "totalClaimed": 620
    }
    ```
*   **Frontend UI:**
    *   Component: `src/app/admin/dashboard/components/CampaignSummaryCard.tsx`
    *   Display: Three distinct cards or a single summary card showing total created, joined, and claimed campaigns.
    *   Interaction: No date range picker as data is static mock data.

### 2. Top Performing Businesses
*   **Mock Data Source:** A JSON array of business objects, each with a name and performance metrics (e.g., total redemptions, points issued).
    ```json
    [
      { "name": "Business A", "redemptions": 500, "pointsIssued": 15000 },
      { "name": "Business B", "redemptions": 450, "pointsIssued": 12000 },
      { "name": "Business C", "redemptions": 300, "pointsIssued": 9000 }
    ]
    ```
*   **Frontend UI:**
    *   Component: `src/app/admin/dashboard/components/TopBusinessesTable.tsx`
    *   Display: A table listing top N businesses with their performance metrics.
    *   Interaction: Dropdown to select ranking metric (simulated, as data is static).

### 3. Most Popular Rewards
*   **Mock Data Source:** A JSON array of reward objects, each with a title and redemption count.
    ```json
    [
      { "title": "10% Off Next Purchase", "redemptionCount": 300 },
      { "title": "Free Coffee", "redemptionCount": 250 },
      { "title": "Buy One Get One Free", "redemptionCount": 180 }
    ]
    ```
*   **Frontend UI:**
    *   Component: `src/app/admin/dashboard/components/PopularRewardsTable.tsx`
    *   Display: A table or list showing rewards ranked by redemption count.

### 4. Points Distributed (Standard vs Matching)
*   **Mock Data Source:** A JSON object or JS variable with total standard and matching points.
    ```json
    {
      "standardPoints": 50000,
      "matchingPoints": 25000
    }
    ```
*   **Frontend UI:**
    *   Component: `src/app/admin/dashboard/components/PointsDistributionChart.tsx`
    *   Display: A bar chart or pie chart showing the distribution of standard vs. matching points.

### 5. Consumer Growth and Activity
*   **Mock Data Source:** A JSON array representing monthly new registrations and activity counts.
    ```json
    [
      { "month": "Jan", "newRegistrations": 50, "activityCount": 200 },
      { "month": "Feb", "newRegistrations": 60, "activityCount": 220 },
      { "month": "Mar", "newRegistrations": 75, "activityCount": 250 }
    ]
    ```
*   **Frontend UI:**
    *   Component: `src/app/admin/dashboard/components/ConsumerGrowthChart.tsx`
    *   Display: Line charts for new registrations and activity trends.

### 6. Business Tier Distribution
*   **Mock Data Source:** A JSON object or JS variable with counts for each tier.
    ```json
    {
      "Starter": 30,
      "Active": 20,
      "Trusted": 10,
      "Partner": 5
    }
    ```
*   **Frontend UI:**
    *   Component: `src/app/admin/dashboard/components/BusinessTierPieChart.tsx`
    *   Display: A pie chart or bar chart showing the percentage/count of businesses in each tier.

### 7. Conversion and Retention Reports
*   **Mock Data Source:** A JSON object or JS variable with conversion rates and retention metrics.
    ```json
    {
      "registrationToJoinRate": "70%",
      "joinToRedeemRate": "85%",
      "monthlyRetentionRate": "60%"
    }
    ```
*   **Frontend UI:**
    *   Component: `src/app/admin/dashboard/components/ConversionRetentionMetrics.tsx`
    *   Display: Simple percentage displays or simulated funnel steps.

### 8. Downloadable (CSV, PDF, XLS)
*   **Frontend Logic:**
    *   Implement client-side data export using JavaScript libraries.
    *   For CSV: Use `JSON.stringify` and manipulate into CSV format.
    *   For PDF: Use `jspdf` or similar library to generate PDF from HTML content or data.
    *   For XLS: Use `xlsx` or similar library to generate Excel files.
*   **Frontend UI:**
    *   Add "Download" buttons to each report component, allowing selection of format.

## Implementation Steps (General)

1.  **Create Mock Data:**
    *   Create a new directory `src/mock/reports/` to store JSON files for each report type.
    *   Populate these files with realistic mock data based on the structures outlined above.
2.  **Frontend Development:**
    *   Create new React components for each report visualization under `src/components/admin/dashboard/reports/`.
    *   Integrate these components into the main `src/app/admin/dashboard/page.tsx`.
    *   Import and use the mock data directly within these components.
    *   Utilize a charting library (e.g., `recharts`, `chart.js`) for data visualization.
    *   Implement client-side download functionality for CSV, PDF, and XLS formats.
3.  **Testing:**
    *   Manually verify that all reports display correctly with the mock data.
    *   Test the download functionality for each report.

## Assumptions & Considerations
*   **Data Realism:** Mock data should be representative enough to demonstrate the UI functionality.
*   **Client-side Performance:** For very large mock datasets, client-side processing for downloads might be slow. For a prototype, this is acceptable.
*   **UI/UX:** Reports should be intuitive and easy to understand for administrators.
*   **Libraries:** Identify and install necessary frontend libraries for charting and client-side file generation (e.g., `recharts`, `jspdf`, `xlsx`).
