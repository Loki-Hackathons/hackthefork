from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_feed():
    """
    Get the social feed (friends' posts).
    """
    pass

@router.post("/post")
async def create_post():
    """
    Upload a photo of a cooked meal.
    Logic: 
    1. Upload image to storage (Supabase).
    2. Call ScoringService to analyze health/eco score.
    3. Save post to DB.
    """
    pass

