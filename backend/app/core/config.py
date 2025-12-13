import os

class Settings:
    PROJECT_NAME: str = "Loki_HackTheFork"
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
settings = Settings()

