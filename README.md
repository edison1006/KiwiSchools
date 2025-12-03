## KiwiSchools

KiwiSchools is a full-stack web application for exploring schools across New Zealand, from early childhood education to universities.  
Tech stack: **FastAPI + PostgreSQL + SQLModel** on the backend, **React + TypeScript + Vite** on the frontend.

### Features (MVP)

- **School coverage**: kindergartens, primary/intermediate/secondary/composite schools, universities, institutes of technology, and private tertiary providers.
- **Core data**:
  - **Kindergarten**: brand, owner/group, description, education systems (Montessori, Reggio Emilia, play-based, bilingual, etc.), fee range, full location, contact info.
  - **Primary–Secondary**: public/private/state-integrated, level (Primary / Intermediate / Secondary / Composite), curriculum (NZ Curriculum / IB / Cambridge / NCEA), tuition range, progression/ranking placeholder fields, school zone & house prices, contact.
  - **Universities & tertiary**: institution type (University / Institute of Technology / Private), QS rank, strong programmes, tuition range (especially for international students), city/campus, contact.
- **Search & filters**:
  - Filter by **region / city / suburb**.
  - Filter by **school type** (kindergarten, primary, secondary, university, etc.).
  - **Keyword search** by school name.
  - **School zone & house price** information on school detail page.

### Project structure

- `backend/` – FastAPI application
  - `app/main.py` – FastAPI entrypoint
  - `app/core/config.py` – settings (environment variables, DB URL)
  - `app/db/session.py` – SQLModel / SQLAlchemy engine and session
  - `app/models/` – SQLModel models
    - `school.py` – unified `School` model with type-specific fields
    - `zone.py` – `SchoolZone` model including median house price
  - `app/schemas/` – Pydantic schemas for API I/O
  - `app/api/routes/` – FastAPI routers (`schools.py`, `zones.py`)
  - `alembic/` + `alembic.ini` – database migrations
  - `requirements.txt` – Python dependencies
- `frontend/` – React + TypeScript + Vite SPA
  - `src/main.tsx`, `src/App.tsx`
  - `src/pages/SchoolListPage.tsx`, `src/pages/SchoolDetailPage.tsx`
  - `src/components/Filters.tsx`, `SearchBar.tsx`, `SchoolCard.tsx`
  - `src/types.ts` – shared TS types matching backend responses
  - `src/styles.css` – simple modern responsive styling

---

### Backend – FastAPI + PostgreSQL

#### 1. Environment setup

Requirements:

- Python 3.11+
- PostgreSQL 14+ (or compatible)

Create and configure database (example):

```sql
CREATE DATABASE kiwischools;
CREATE USER kiwischools_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE kiwischools TO kiwischools_user;
```

Create backend virtualenv and install dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` inside `backend/` (adjust credentials):

```bash
echo "DATABASE_URL=postgresql://kiwischools_user:your-password@localhost:5432/kiwischools" > .env
```

The app will default to `postgresql://postgres:postgres@localhost:5432/kiwischools` if `DATABASE_URL` is not set.

#### 2. Database migrations (Alembic)

From `backend/`:

```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

This will create tables for:

- `School` – unified table for all school types with specific optional fields.
- `SchoolZone` – zones with median house prices and last update date.

#### 3. Running the backend

From `backend/`:

```bash
uvicorn app.main:app --reload --port 8000
```

API examples:

- `GET /health` – health check.
- `GET /schools` – list schools, supports query params:
  - `school_type` – `kindergarten | primary | intermediate | secondary | composite | university | institute_of_technology | private_tertiary`
  - `region`, `city`, `suburb`
  - `name` – keyword search (partial match).
- `GET /schools/{id}` – school detail.
- `GET /zones` – list zones.
- `GET /zones/{id}` – zone detail.

All responses are JSON and designed to be easy to extend with more metrics and visualisations.

---

### Frontend – React + TypeScript + Vite

#### 1. Install dependencies

```bash
cd frontend
npm install
```

#### 2. Run dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.  
It expects the FastAPI backend at `http://localhost:8000`.

#### 3. Frontend pages & UX

- **School list** (`/`):
  - Hero section describing KiwiSchools.
  - Search bar for **school name keyword**.
  - Filters for **region / city / suburb** and **school type**.
  - Responsive grid of cards with:
    - Name, type, curriculum / QS rank snippets.
    - Location.
    - Zone + median house price (when available).
- **School detail** (`/schools/:id`):
  - High-level tags (type, level, institution type).
  - Sections for education, tuition, zone & house prices, and contact info.

Styles are implemented via `src/styles.css` with a clean, modern, responsive layout (desktop & mobile).

---

### Next steps / extension ideas

- Import real NZ school datasets and seed the database.
- Add charts for:
  - House price trends per zone.
  - Progression rates and rankings over time.
  - Tuition comparison across regions and school types.
- Add authentication for saving favourite schools and personalised shortlists.
- Internationalisation (Chinese/English) for parents and students.