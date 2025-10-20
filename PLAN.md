### Updated Plan for Production-Grade Admin Authentication

1.  **API State Management:**
    *   Create a centralized API service to manage API-related concerns like base URL, headers, and authentication tokens. This will make the code more modular, maintainable, and easier to debug.
    *   I will create a file at `src/lib/api.ts` to house the API service. This service will use `axios` for making HTTP requests.
    *   The service will have methods for making authenticated and unauthenticated requests. It will automatically add the bearer token to authenticated requests.
    *   I will also create a mechanism to store the access token securely in the browser's local storage.

2.  **Custom Hook for Login:**
    *   Create a custom hook `useLogin` to encapsulate the login logic.
    *   This hook will handle the API call, state management for loading and error states, and storing the access token.
    *   I will create a file at `src/hooks/useLogin.ts` for this custom hook.
    *   Proper TypeScript types will be used for the hook's state and props.

3.  **Login Functionality:**
    *   Implement the `login` function in the `LoginDialog` component using the `useLogin` custom hook.
    *   Upon successful login, the access token will be stored in local storage, and the user will be redirected to the admin dashboard.
    *   Error handling will be implemented to display appropriate messages to the user in case of invalid credentials or other server errors.

4.  **Middleware for Protected Routes:**
    *   Create a middleware file at `src/middleware.ts` to protect the admin dashboard from unauthorized access.
    *   The middleware will check for the presence and validity of the access token in the user's browser.
    *   If the token is missing or invalid, the user will be redirected to the landing page.
    *   I will use Next.js middleware to achieve this.

5.  **Save the Plan:**
    *   Save this updated plan as a markdown file named `PLAN.md` in the root of the project.