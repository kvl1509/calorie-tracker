from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    environment: str = "development"
    port: int = 8000
    host: str = "0.0.0.0"
    
    database_url: str = "sqlite:///./calorie_tracker.db"
    
    ai_provider: str = os.getenv("AI_PROVIDER") # gemini, openai, fallback
    ai_api_key: str = os.getenv("AI_API_KEY")
    ai_model: str = os.getenv("AI_MODEL")
    
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    
    resend_api_key: str = os.getenv("RESEND_API_KEY")
    
    emails_from_email: str = os.getenv("EMAILS_FROM_EMAIL")
    emails_from_name: str = os.getenv("EMAILS_FROM_NAME", "BitWise AI")
    
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
