# KuriftuOs: The Future of Resort Management

![Kuriftu Resort](https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3)

KuriftuOs is a state-of-the-art Operation System designed specifically for luxury resorts like Kuriftu. It combines seamless guest experiences with powerful administrative tools through AI-driven automation, real-time analytics, and dynamic optimizations.

## 🌟 Vision & Goals
- **Guest-Centric Experience**: Personalized stay through AI Concierge and smart room controls.
- **Operational Efficiency**: Automated task management and staff scheduling.
- **Revenue Optimization**: Data-driven dynamic pricing to maximize occupancy and revenue.
- **Digital Transformation**: Bringing luxury hospitality into the age of AI and automation.

---

## 🏗️ Core Components

### 🧠 AI Concierge & Smart Automation
- **AI-Powered Chat**: Real-time guest assistance using Gemini LLMs.
- **Smart Room Control**: Direct control of lighting, temperature, and mood via the app.
- **Voice Commands**: Multilingual support for guest requests.

### 📈 Dynamic Pricing Engine
Our proprietary engine adjusts room rates in real-time based on recursive factors:
- **Ethiopian Context**: Automatic premium adjustments for holidays like *Enkutatash*, *Meskel*, and *Genna*.
- **Market Demand**: Real-time occupancy-based surcharges.
- **Optimization**: Gradient Boosting ML model calibrates multipliers based on booking history.

### 📊 Staff & Task Management
- **Role-Based Dashboards**: Tailored views for Admins, Managers, and Staff.
- **Automated Dispatch**: Guest requests are instantly routed to the relevant department (Housekeeping, Maintenance, etc.).

---

## 💻 Technical Architecture

### Backend (Python/FastAPI)
- **Framework**: FastAPI (Asynchronous)
- **Database**: PostgreSQL with `pgvector` for similarity search in AI responses.
- **ORMs**: SQLAlchemy 2.0 (Async) + Alembic for migrations.
- **Auth**: JWT-based security with department-level role checks.

### Frontend (TypeScript/Next.js)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & Framer Motion for premium animations.
- **Icons**: Lucide React.
- **State**: Precise real-time updates via API polling and hooks.

---

## 🛠️ Quick Start

### 1. Requirements
- Python 3.10+
- Node.js 18+
- Docker (for database & redis)

### 2. Backend Setup
```bash
cd KuriftuOs/backend
# Initialize environment (.env)
./switch_env.sh local
# Install dependencies
pip install -r requirements.txt
# Create & Seed Database
python3 init_db.py
python3 seed_pricing.py
# Start Server
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd KuriftuOs/frontend
npm install
npm run dev
```

## 📝 License
Proprietary software developed for Kuriftu Resort & Entoto Park.

---
*Transforming hospitality through agentic automation.*
