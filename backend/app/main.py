from fastapi import FastAPI
from app.api.v1 import auth, recipes, feed, shopping, users

app = FastAPI(title="HackTheFork API", version="0.1.0")

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(recipes.router, prefix="/api/v1/recipes", tags=["Recipes"])  # Tinder-like feature
app.include_router(feed.router, prefix="/api/v1/feed", tags=["Feed"])        # BeReal-like feature
app.include_router(shopping.router, prefix="/api/v1/shopping", tags=["Shopping"]) # Jow-like feature

@app.get("/")
async def root():
    return {"message": "HackTheFork Backend is running"}

