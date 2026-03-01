# ============================================================
# CONFIG.PY — Settings file for your entire project
# Think of this like your project's "settings menu" in a game.
# All important settings like passwords and API keys go here.
# ============================================================

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "StockSight AI"
    DEBUG: bool = True

    # Production Database URL (comes from Render)
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # API Keys
    ALPHA_VANTAGE_KEY: str = "demo"
    NEWS_API_KEY: str = "demo"

    class Config:
        env_file = ".env"


settings = Settings()