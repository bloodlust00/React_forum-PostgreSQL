# 📚 Complete Project Guide — Academix Student Registry

This guide teaches you **everything** about how this project works — from the database layer at the bottom, through the Python API in the middle, all the way up to the React UI in your browser.

---

## 1. The Big Picture — Architecture Overview

```mermaid
graph LR
    A["🖥️ Browser<br/>(React + Vite)"] -->|"HTTP Requests<br/>(JSON)"| B["⚡ FastAPI Server<br/>(Python)"]
    B -->|"SQL Queries<br/>(SQLAlchemy ORM)"| C["🐘 PostgreSQL<br/>(Database)"]
    C -->|"Rows / Results"| B
    B -->|"JSON Responses"| A
```

There are **three independent layers** that talk to each other:

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | React + Vite + TailwindCSS | What the user sees and interacts with |
| **Backend** | Python + FastAPI | Receives requests, runs business logic, talks to database |
| **Database** | PostgreSQL (via pgAdmin4) | Stores all student records permanently on disk |

> [!IMPORTANT]
> The frontend and backend are **completely separate applications**. The frontend runs on `localhost:5173` (Vite dev server) and the backend runs on `localhost:8000` (Uvicorn). They communicate over HTTP — just like any website talking to an API.

---

## 2. PostgreSQL Database — Where Data Lives

### What is PostgreSQL?
PostgreSQL (often called "Postgres") is a **relational database**. Think of it as a giant, highly optimized Excel spreadsheet that lives on your computer. Data is organized into **tables** with **rows** and **columns**.

### Your Database Structure

You created a database called `Student` in pgAdmin4. Inside it, there is one table called `students`:

```
┌─────────────────────────────────────────────────────────────────┐
│                        students TABLE                          │
├────────┬────────────┬─────────────┬──────────┬─────────────────┤
│   id   │ first_name │  last_name  │   dob    │ qualification   │
│ (int)  │  (string)  │  (string)   │  (date)  │   (string)      │
├────────┼────────────┼─────────────┼──────────┼─────────────────┤
│   1    │  Santosh   │  Somthing   │ 2021-03  │    M.Sc         │
│   2    │  Anjali    │  Kumari     │ 2003-11  │    M.Tech       │
└────────┴────────────┴─────────────┴──────────┴─────────────────┘
```

Each column has a **data type** (integer, string, date, etc.). The `id` column is the **primary key** — a unique identifier that PostgreSQL auto-increments for every new row.

### The `languages_known` Column — JSON Storage

Languages are stored as a **JSON array** inside a single column:

```
languages_known: ["English", "Hindi", "French"]
```

This is a neat trick — instead of creating a separate table for languages, we store the list directly as JSON text. PostgreSQL has excellent JSON support for this.

### How the Database File is Defined

The database schema is defined in Python code (not SQL!) using SQLAlchemy. See section 4 below.

---

## 3. Python — The Programming Language

### Why Python?
Python is the backend language. It's used because:
- It's easy to read and write
- FastAPI (the web framework) is built on Python
- SQLAlchemy (the database toolkit) is a Python library

### Virtual Environment (`venv`)
The `backend/venv/` folder is a **virtual environment** — an isolated copy of Python with its own installed packages. This prevents conflicts between different projects on your machine.

```
backend/
├── venv/                  ← Isolated Python environment
│   └── Scripts/
│       └── python.exe     ← The Python interpreter used for this project
├── requirements.txt       ← List of packages to install
└── main.py               ← Entry point of the backend
```

The `requirements.txt` file lists every package needed:
```
fastapi          ← The web framework
uvicorn          ← The server that runs FastAPI
sqlalchemy       ← The database ORM
psycopg2-binary  ← PostgreSQL driver (lets Python talk to Postgres)
python-dotenv    ← Reads .env configuration files
pydantic         ← Data validation library
```

---

## 4. FastAPI Backend — The API Server

### What is FastAPI?
FastAPI is a **web framework** for Python. It lets you create **API endpoints** — URLs that accept requests and return data. When your React app needs to fetch students or save a new one, it sends an HTTP request to FastAPI.

### How the Backend is Organized

```
backend/
├── main.py                    ← App entry point, CORS config
├── config.py                  ← Reads .env settings
├── .env                       ← Secret credentials (DB password, etc.)
├── database/
│   └── db.py                  ← Database connection setup
├── models/
│   └── student_model.py       ← Database table definition (SQLAlchemy)
├── schemas/
│   └── student_schema.py      ← Request/Response validation (Pydantic)
├── services/
│   └── student_service.py     ← Business logic (CRUD operations)
└── routes/
    └── student_routes.py      ← API endpoint definitions
```

Let's walk through each file and understand what it does:

---

### 4a. Configuration — [.env](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/backend/.env) + [config.py](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/backend/config.py)

The `.env` file stores sensitive data like passwords:
```env
DB_USER=postgres
DB_PASSWORD=honey00
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Student
```

`config.py` reads these values and constructs the **database connection URL**:
```python
DATABASE_URL = "postgresql://postgres:honey00@localhost:5432/Student"
#               ↑ protocol    ↑ user   ↑ password  ↑ host  ↑ port ↑ database name
```

This URL is like an address that tells Python exactly where the database is and how to log in.

---

### 4b. Database Connection — [db.py](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/backend/database/db.py)

This file creates the **engine** and **session**:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Engine = the connection pool to PostgreSQL
engine = create_engine(DATABASE_URL)

# SessionLocal = a factory that creates database sessions
SessionLocal = sessionmaker(bind=engine)

# Base = parent class for all database models
class Base(DeclarativeBase):
    pass

# get_db = a function that gives each API request its own session
def get_db():
    db = SessionLocal()
    try:
        yield db        # ← Give the session to the route handler
    finally:
        db.close()      # ← Always close when done
```

> [!TIP]
> Think of `engine` as the **phone line** to the database, `Session` as a **phone call**, and `get_db()` as the function that dials the number, lets you talk, then hangs up.

---

### 4c. Database Model — [student_model.py](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/backend/models/student_model.py)

This defines the `students` table structure **in Python code**:

```python
from sqlalchemy import Column, Integer, String, Date, JSON, DateTime
from backend.database.db import Base

class Student(Base):
    __tablename__ = "students"        # ← Name of the table in PostgreSQL

    id = Column(Integer, primary_key=True, index=True)   # Auto-incrementing ID
    first_name = Column(String, nullable=False)           # Required field
    middle_name = Column(String, nullable=True)           # Optional field
    last_name = Column(String, nullable=False)            # Required field
    dob = Column(Date, nullable=False)                    # Date of birth
    qualification = Column(String, nullable=False)        # e.g. "B.Tech"
    languages_known = Column(JSON, default=[])            # Stored as JSON array
    created_at = Column(DateTime, server_default=...)     # Auto-set timestamp
```

When the app starts, SQLAlchemy reads this class and creates the actual PostgreSQL table with matching columns. This is called **ORM (Object-Relational Mapping)** — you define database tables as Python classes.

---

### 4d. Pydantic Schemas — [student_schema.py](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/backend/schemas/student_schema.py)

Schemas validate the **shape of data** coming in (from the frontend) and going out (to the frontend):

```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# What the frontend sends when CREATING a student
class StudentCreate(BaseModel):
    first_name: str                    # Must be a string
    middle_name: Optional[str] = None  # Optional
    last_name: str                     # Must be a string
    dob: date                          # Must be a valid date
    qualification: str                 # Must be a string
    languages_known: List[str] = []    # List of strings, default empty

# What the backend sends BACK to the frontend
class StudentResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    dob: date
    qualification: str
    languages_known: list
    created_at: datetime
```

> [!NOTE]
> **Why two separate schemas?** When creating a student, you don't send an `id` or `created_at` — the database generates those. But when reading a student, you need them. So we have different schemas for different directions.

---

### 4e. Service Layer — [student_service.py](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/backend/services/student_service.py)

This contains the **actual database operations** (CRUD = Create, Read, Update, Delete):

```python
class StudentService:
    @staticmethod
    def create(db, student_data):
        # 1. Create a Python object from the incoming data
        new_student = Student(
            first_name=student_data.first_name,
            last_name=student_data.last_name,
            dob=student_data.dob,
            ...
        )
        # 2. Add it to the session (like staging in git)
        db.add(new_student)
        # 3. Commit to the database (actually writes to PostgreSQL)
        db.commit()
        # 4. Refresh to get the auto-generated id and created_at
        db.refresh(new_student)
        return new_student

    @staticmethod
    def get_all(db, search, qualification, sort_by, sort_order, skip, limit):
        query = db.query(Student)

        # Apply search filter
        if search:
            query = query.filter(Student.first_name.ilike(f"%{search}%"))

        # Apply sorting
        if sort_order == "desc":
            query = query.order_by(desc(sort_col))

        # Get total count (before pagination)
        total = query.count()

        # Apply pagination (skip N records, take M records)
        records = query.offset(skip).limit(limit).all()

        return records, total

    @staticmethod
    def get_stats(db):
        students = db.query(Student).all()
        # Count qualifications and languages
        # Return aggregated statistics
```

---

### 4f. API Routes — [student_routes.py](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/backend/routes/student_routes.py)

Routes map **HTTP methods + URLs** to Python functions:

```python
router = APIRouter(prefix="/students")

@router.post("")                    # POST /api/students
def create_student(student: StudentCreate, db = Depends(get_db)):
    return StudentService.create(db, student)

@router.get("")                     # GET /api/students?search=...&page=...
def get_students(search, qualification, sort_by, skip, limit, db = Depends(get_db)):
    records, total = StudentService.get_all(db, ...)
    return {"students": records, "total": total}

@router.get("/stats")              # GET /api/students/stats
def get_stats(db = Depends(get_db)):
    return StudentService.get_stats(db)

@router.put("/{student_id}")       # PUT /api/students/5
def update_student(student_id, student_data, db = Depends(get_db)):
    return StudentService.update(db, student_id, student_data)

@router.delete("/{student_id}")    # DELETE /api/students/5
def delete_student(student_id, db = Depends(get_db)):
    return StudentService.delete(db, student_id)
```

> [!TIP]
> `Depends(get_db)` is **dependency injection**. FastAPI automatically calls `get_db()`, creates a database session, passes it to the function, and closes it when done. You never manage sessions manually.

---

### 4g. App Entry Point — [main.py](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/backend/main.py)

```python
app = FastAPI(title="Academix")

# CORS: Allow the React frontend (localhost:5173) to call this API
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)

# Register the routes
app.include_router(student_router, prefix="/api")

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)
```

> [!IMPORTANT]
> **CORS (Cross-Origin Resource Sharing)**: Browsers block requests from one domain to another by default. Since React runs on port `5173` and FastAPI runs on port `8000`, the browser would block the request. CORS middleware tells the browser: "It's okay, allow requests from the frontend."

---

## 5. The Full Request Lifecycle — What Happens When You Click "Register"

Here's the **exact sequence** of events when you register a student:

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant R as ⚛️ React App
    participant A as 📡 Axios
    participant F as ⚡ FastAPI
    participant S as 🔧 Service
    participant D as 🐘 PostgreSQL

    U->>R: Fills form, clicks "Register"
    R->>R: Validates form fields
    R->>A: createStudent(formData)
    A->>F: POST /api/students (JSON body)
    F->>F: Pydantic validates the JSON
    F->>S: StudentService.create(db, data)
    S->>D: INSERT INTO students VALUES(...)
    D-->>S: Returns new row with id=3
    S-->>F: Returns Student object
    F-->>A: 201 Created (JSON response)
    A-->>R: Promise resolves with data
    R->>R: onSuccess: invalidate queries
    R->>A: Refetch GET /api/students
    R->>A: Refetch GET /api/students/stats
    A->>F: GET requests
    F->>D: SELECT queries
    D-->>F: Updated data
    F-->>A: JSON responses
    A-->>R: New data arrives
    R->>U: UI updates with new student in table + updated charts
```

---

## 6. React Frontend — The User Interface

### How React Works (The Basics)

React builds UIs from **components** — reusable pieces of UI, each in its own file. Components are JavaScript functions that return HTML-like syntax called **JSX**:

```jsx
function Greeting({ name }) {
    return <h1>Hello, {name}!</h1>;
}
```

React uses a **virtual DOM** — when data changes, React figures out the minimum number of actual DOM updates needed, making it very fast.

### Your Component Tree

```
App.jsx
├── <header>           ← Sticky navigation bar
├── <StatsCard>        ← Three KPI widgets at the top
├── <StudentGrid>      ← The data table with search, filter, pagination
├── <StudentForm>      ← Inside a modal (hidden until "Register" is clicked)
├── <EditDrawer>       ← Slide-in panel for editing
└── <ConfirmModal>     ← Delete confirmation popup
```

---

### 6a. State Management — `useState`

React components remember data using **state**:

```jsx
const [filters, setFilters] = useState({
    search: '',
    qualification: '',
    page: 1,
    limit: 5
});
```

When you call `setFilters(...)`, React **re-renders** the component with the new values. This is how the search box, pagination, and filters work — changing state triggers a UI update.

---

### 6b. Axios — The HTTP Client — [api.js](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/frontend/src/services/api.js)

Axios is a library that makes HTTP requests from the browser to the backend:

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',   // ← All requests go here
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,  // 10 seconds
});
```

Now you can do:
```javascript
api.get('/students')           // → GET  http://localhost:8000/api/students
api.post('/students', data)    // → POST http://localhost:8000/api/students
api.put('/students/5', data)   // → PUT  http://localhost:8000/api/students/5
api.delete('/students/5')      // → DELETE http://localhost:8000/api/students/5
```

---

### 6c. TanStack React Query — [useStudents.js](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/frontend/src/hooks/useStudents.js)

React Query is the **most important piece** of the frontend. It manages:
- **Fetching** data from the API
- **Caching** data so you don't re-fetch unnecessarily
- **Refetching** when data becomes stale
- **Loading** and **error** states

#### Queries (Reading Data)

```javascript
const studentsQuery = useQuery({
    queryKey: ['students', { search, page, ... }],  // ← Unique cache key
    queryFn: async () => {
        const response = await api.get('/students', { params: { ... } });
        return response.data;
    },
    staleTime: 5000,  // ← Data is "fresh" for 5 seconds
});

// Usage in JSX:
studentsQuery.isLoading   // → true while fetching
studentsQuery.isError     // → true if request failed
studentsQuery.data        // → the actual student records
```

The **queryKey** `['students', { search, page }]` acts as a cache identifier. If you search for "John" and then search for "Jane", React Query caches both results separately. Going back to "John" uses the cache instantly.

#### Mutations (Writing Data)

```javascript
const createMutation = useMutation({
    mutationFn: async (newStudent) => {
        const response = await api.post('/students', newStudent);
        return response.data;
    },
    onSuccess: () => {
        // After creating a student, tell React Query:
        // "The cached student list and stats are now outdated!"
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['student-stats'] });

        // Force an immediate refetch (don't wait for staleTime)
        queryClient.refetchQueries({ queryKey: ['students'] });
        queryClient.refetchQueries({ queryKey: ['student-stats'] });
    }
});
```

> [!IMPORTANT]
> **This is how the stats and table update concurrently.** When `onSuccess` fires after a successful POST, it tells React Query: "Your cached data for `['students']` and `['student-stats']` is invalid — go fetch new data from the API right now." React Query does both fetches in parallel, and when they return, the components re-render with the new data.

---

### 6d. Cross-Tab Synchronization — BroadcastChannel

When you have the app open in **two browser tabs**, Tab 1 doesn't know about changes made in Tab 2 — they have separate React Query caches.

We solved this with the browser's built-in **BroadcastChannel API**:

```javascript
// Create a shared communication channel
const syncChannel = new BroadcastChannel('academix_registry_sync');

// SENDING (after a mutation succeeds):
syncChannel.postMessage('sync_student_records');

// RECEIVING (in every tab):
syncChannel.addEventListener('message', (event) => {
    if (event.data === 'sync_student_records') {
        // Another tab made changes! Refetch everything.
        queryClient.refetchQueries({ queryKey: ['students'] });
        queryClient.refetchQueries({ queryKey: ['student-stats'] });
    }
});
```

```mermaid
graph LR
    T1["Tab 1<br/>Registers a student"] -->|"postMessage"| BC["BroadcastChannel<br/>'academix_registry_sync'"]
    BC -->|"message event"| T2["Tab 2<br/>Refetches data automatically"]
    BC -->|"message event"| T3["Tab 3<br/>Refetches data automatically"]
```

---

## 7. Styling — TailwindCSS v4

### What is TailwindCSS?
Instead of writing CSS in separate files, you apply styles directly as class names:

```html
<!-- Traditional CSS -->
<button class="submit-btn">Submit</button>
<!-- .submit-btn { background: #1e293b; color: white; padding: 10px 24px; border-radius: 12px; } -->

<!-- TailwindCSS -->
<button class="bg-slate-900 text-white px-6 py-2.5 rounded-xl">Submit</button>
```

Every class maps to a single CSS property. You compose them together to build any design without writing custom CSS.

### How Tailwind is Configured

In this project (TailwindCSS v4), styling is configured via the [index.css](file:///c:/Users/Honey/OneDrive/Desktop/react%20app/frontend/src/index.css) file:

```css
@import "tailwindcss";     /* ← Loads all of Tailwind's utility classes */

@theme {
    --color-primary: #1E293B;   /* Custom color tokens */
    --color-accent: #2563EB;
}
```

The Vite build plugin (`@tailwindcss/vite`) scans your JSX files, finds all the Tailwind classes you used, and generates only the CSS you need — keeping the bundle tiny.

---

## 8. The Dev Server — Vite

**Vite** is the development server and build tool for the frontend:
- During development: It serves your React files with **Hot Module Replacement (HMR)** — when you save a file, the browser updates instantly without a full page reload
- For production: It bundles everything into optimized static files

The `start.bat` script launches both servers simultaneously:
```bat
start "Backend" python -m uvicorn backend.main:app --port 8000 --reload
start "Frontend" cd frontend && npm run dev
```

`--reload` on the backend means Uvicorn watches for file changes and auto-restarts.

---

## 9. Summary — How Everything Connects

```mermaid
graph TB
    subgraph "🖥️ Browser (localhost:5173)"
        UI["React Components<br/>(App, StudentGrid, StatsCard, StudentForm)"]
        RQ["TanStack React Query<br/>(Cache + Auto-refetch)"]
        AX["Axios HTTP Client<br/>(api.js)"]
        BC["BroadcastChannel<br/>(Cross-tab sync)"]
        UI --> RQ
        RQ --> AX
        BC -.->|"sync signal"| RQ
    end

    subgraph "⚡ FastAPI Server (localhost:8000)"
        RT["Routes<br/>(student_routes.py)"]
        SC["Schemas<br/>(Pydantic validation)"]
        SV["Services<br/>(Business logic)"]
        RT --> SC
        SC --> SV
    end

    subgraph "🐘 PostgreSQL (localhost:5432)"
        DB["students table<br/>(id, first_name, last_name, dob, ...)"]
    end

    AX -->|"HTTP/JSON"| RT
    SV -->|"SQLAlchemy ORM"| DB
```

| Step | What Happens |
|------|-------------|
| 1 | User interacts with React UI |
| 2 | React Query triggers an Axios HTTP request |
| 3 | Axios sends JSON to FastAPI on port 8000 |
| 4 | FastAPI validates data with Pydantic schemas |
| 5 | Service layer runs SQLAlchemy queries |
| 6 | SQLAlchemy translates Python to SQL and sends it to PostgreSQL |
| 7 | PostgreSQL executes the SQL and returns results |
| 8 | Results flow back through the same chain as JSON |
| 9 | React Query caches the response and updates the UI |
| 10 | BroadcastChannel notifies other tabs to sync |

---

> [!TIP]
> **Want to explore the API interactively?** Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser. FastAPI auto-generates a **Swagger UI** where you can test every endpoint, see request/response schemas, and try out queries — all without writing any code.
