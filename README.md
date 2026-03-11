# CodeLeap Network

CodeLeap Network is a modern, responsive social media web application built with **Next.js 16** and **React 19**. It features a dynamic feed with real-time-like interactions, secure authentication, and a scalable architecture.

## 🚀 Features

- **Google Authentication**: Secure login using Firebase Auth.
- **Dynamic Feed**: Full CRUD (Create, Read, Update, Delete) for posts.
- **Infinite Scrolling**: Optimized data fetching using TanStack Query's Infinite Query.
- **Comments System**: Interactive comment section for each post with full CRUD support and infinite scroll.
- **Optimistic Likes**: Instant feedback when liking posts with background synchronization.
- **Modern UI**: Clean, mobile-first design built with Tailwind CSS v4 and Roboto font.
- **Unit Testing**: Robust test coverage for critical paths (Auth, Hooks, API, and Utils) using Vitest.
- **Dockerized**: Ready for containerized deployment with multi-stage builds.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/), [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Fetching**: [TanStack Query v5 (React Query)](https://tanstack.com/query/latest)
- **API Client**: [Axios](https://axios-http.com/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Deployment**: [Docker](https://www.docker.com/)

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: `v22` or higher
- **npm**: `v10` or higher
- **Docker** (optional, for containerized run)

### Environment Variables

Create a `.env` file in the root directory and populate it with your credentials:

```env
# API
NEXT_PUBLIC_API_BASE_URL=your_api_base_url

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd codeleap-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

We use **Vitest** for unit and integration tests. To ensure the reliability of the application, we focus on critical paths:

- **AuthContext**: Validates login flow and user state management.
- **API Interceptors**: Ensures JWT tokens are correctly attached to requests.
- **Custom Hooks**: Validates cache synchronization after CRUD operations.
- **Utils**: Validates business logic like relative time calculation.

Run tests:
```bash
npm test
```

Run tests with UI:
```bash
npm run test:ui
```

---

## 🐳 Docker Deployment

The project is optimized for Docker using a multi-stage `Dockerfile` and `docker-compose.yml`.

### Shared Network Integration
This setup is configured to use an external network named `shared_network`. Ensure it exists before running:
```bash
docker network create shared_network
```

### Build and Run
Build the optimized image and start the container:
```bash
docker compose up -d --build
```

The application will be available at `http://localhost:3001`.

---

## 📁 Project Structure

- `app/`: Next.js routes and layouts.
- `components/`: Modular React components (UI, Feed, Shared).
- `context/`: Global state providers (Auth).
- `hooks/`: Custom hooks for data fetching and logic.
- `lib/`: API configuration, Firebase setup, and utilities.
- `public/`: Static assets and icons.

---

Developed with ❤️ for the CodeLeap Challenge.
