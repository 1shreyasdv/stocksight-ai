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

    # MySQL Database settings
    # Since your password is empty, we leave DB_PASSWORD blank
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "shreyas"
    DB_NAME: str = "stocksight"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # JWT Secret Key — used to create login tokens
    SECRET_KEY: str = "stocksight-super-secret-key-change-this-later"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # API Keys
    ALPHA_VANTAGE_KEY: str = "demo"
    NEWS_API_KEY: str = "demo"

    class Config:
        env_file = ".env"

# Create one settings object to use everywhere
settings = Settings()