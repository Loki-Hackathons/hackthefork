# HackTheFork - Project Skeleton

## Project Structure

The project is divided into two main parts:
- `backend/`: Python FastAPI application (Logic, AI, Scoring).
- `frontend/`: TypeScript/Vite WebApp (UI generated via Figma, Logic).

## File Guide (Detailed)

### Backend (`backend/`)
- `requirements.txt`: Python dependencies list (FastAPI, Supabase, etc.).
- `app/main.py`: Application entry point, aggregates all API routers.
- `app/core/config.py`: Environment configuration (Supabase URL/Key, Project settings).
- `app/api/v1/auth.py`: Authentication endpoints (Login/Register wrapper).
- `app/api/v1/feed.py`: "BeReal" feature endpoints (Get feed, Post photo).
- `app/api/v1/recipes.py`: "Tinder" feature endpoints (Get recommendations, Swipe action).
- `app/api/v1/shopping.py`: "Jow" feature endpoints (Add recipe to cart, Checkout).
- `app/api/v1/users.py`: User profile and leaderboard endpoints.
- `app/services/recommendation_service.py`: Logic for the recipe recommendation algorithm.
- `app/services/scoring_service.py`: Logic for calculating Eco/Healthy scores (Image + Product data).
- `app/services/shopping_service.py`: Logic to convert abstract recipes into specific retailer products.

### Frontend (`frontend/`)
- `package.json`: Node dependencies (TypeScript, Vite).
- `index.html`: Application HTML entry point.
- `src/main.ts`: TypeScript entry point, mounts the React app.
- `src/types/index.ts`: Shared TypeScript interfaces (User, Recipe, Post data models).
- `src/services/api.ts`: Axios/Fetch wrapper for communicating with the Python Backend.
- `src/features/auth/authService.ts`: Supabase Auth logic wrapper.
- `src/features/shopping/shoppingService.ts`: Cart management and Checkout logic.
- `src/features/swipe/SwipeDeck.ts`: Logic/Component for the recipe card stack.
- `src/features/social/`: Directory reserved for Feed/Camera components.

## How to split tasks (Team of 4)

### Developer 1: The "Tinder" Mechanic (Frontend + API)
- **Focus**: `frontend/src/features/swipe/` and `backend/app/api/v1/recipes.py`
- **Goal**: Build the swipe UI and the recommendation algorithm connection.

### Developer 2: Social & Feed (Frontend + API)
- **Focus**: `frontend/src/features/social/` and `backend/app/api/v1/feed.py`
- **Goal**: Build the "BeReal" style feed, photo uploading, and display.

### Developer 3: Shopping & Jow Integration (Frontend + API)
- **Focus**: `frontend/src/features/shopping/` and `backend/app/api/v1/shopping.py`
- **Goal**: Handle the cart logic and the "Recipe to Products" conversion.

### Developer 4: Core, Auth & Scoring Engine (Backend Focus)
- **Focus**: `backend/app/services/scoring_service.py`, `backend/app/core/`, and Auth setup.
- **Goal**: Implement the "Healthy/Eco" scoring algorithm and manage database models/Supabase config.

## Setup

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
