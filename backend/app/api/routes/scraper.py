"""
API endpoints for data scraping operations.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, HttpUrl

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.services.scraper import scrape_kindergartens

router = APIRouter(prefix="/api/v1/scraper", tags=["scraper"])


class ScrapeRequest(BaseModel):
    sources: Optional[List[str]] = None
    update_existing: bool = True


class ScrapeResponse(BaseModel):
    status: str
    message: str
    task_id: Optional[str] = None


# In-memory task status (in production, use Redis or a task queue)
scraping_tasks: dict = {}


@router.post("/kindergartens", response_model=dict)
async def trigger_kindergarten_scrape(
    *,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    request: ScrapeRequest = ScrapeRequest(),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Trigger scraping of kindergarten data from various sources.
    Requires authentication.
    
    This endpoint starts a background task to scrape data.
    For immediate scraping, use the synchronous endpoint.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can trigger data scraping"
        )
    
    # Start background task
    task_id = f"scrape_{current_user.id}_{len(scraping_tasks)}"
    scraping_tasks[task_id] = {"status": "running", "progress": 0}
    
    async def run_scrape():
        try:
            result = await scrape_kindergartens(db, request.sources)
            scraping_tasks[task_id] = {
                "status": "completed",
                "result": result,
            }
        except Exception as e:
            scraping_tasks[task_id] = {
                "status": "failed",
                "error": str(e),
            }
    
    background_tasks.add_task(run_scrape)
    
    return {
        "status": "started",
        "message": "Kindergarten scraping task started",
        "task_id": task_id,
    }


@router.post("/kindergartens/sync", response_model=dict)
async def scrape_kindergartens_sync(
    *,
    db: Session = Depends(get_db),
    request: ScrapeRequest = ScrapeRequest(),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Synchronously scrape kindergarten data.
    Requires authentication.
    
    This endpoint will wait for the scraping to complete before returning.
    Use this for small datasets or when you need immediate results.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can trigger data scraping"
        )
    
    try:
        result = await scrape_kindergartens(db, request.sources)
        return {
            "status": "success",
            "message": "Kindergarten data scraped successfully",
            **result,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scraping failed: {str(e)}"
        )


@router.get("/kindergartens/status/{task_id}", response_model=dict)
def get_scrape_status(
    *,
    task_id: str,
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Get the status of a scraping task.
    Requires authentication.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can view scraping status"
        )
    
    if task_id not in scraping_tasks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return scraping_tasks[task_id]


@router.get("/kindergartens/sources", response_model=dict)
def get_available_sources(
    current_user: User = Depends(get_current_active_user),
) -> dict:
    """
    Get list of available data sources for scraping.
    Requires authentication.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can view data sources"
        )
    
    # List of available data sources
    sources = [
        {
            "name": "Ministry of Education API",
            "url": "https://api.education.govt.nz/kindergartens",
            "type": "api",
            "status": "available",
        },
        {
            "name": "Education Counts",
            "url": "https://www.educationcounts.govt.nz/data",
            "type": "web",
            "status": "available",
        },
        # Add more sources as needed
    ]
    
    return {
        "sources": sources,
        "total": len(sources),
    }



