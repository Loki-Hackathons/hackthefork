from fastapi import APIRouter

router = APIRouter()

@router.post("/cart/add-recipe")
async def add_recipe_to_cart(recipe_id: str):
    """
    Convert a recipe into a list of specific products available at the retailer.
    Logic: Call ShoppingService to match ingredients to products.
    """
    pass

@router.post("/checkout")
async def checkout():
    """
    Trigger the order via retailer SSO/API.
    """
    pass

