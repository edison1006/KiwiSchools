from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import schools, zones
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
    )

    # CORS (allow localhost frontend during development)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(schools.router)
    app.include_router(zones.router)

    @app.get("/health")
    def health_check() -> dict:
        return {"status": "ok"}

    return app


app = create_app()


