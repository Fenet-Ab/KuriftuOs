# KuriftuOs Dynamic Pricing Engine

A rule-based and ML-assisted dynamic pricing engine for the Kuriftu resort. This system allows for real-time room rate adjustments based on holidays, demand, lead time, and seasonality.

## 🚀 Features

- **Multi-Factor Pricing**: Combines 5 distinct multipliers to calculate the final room rate.
- **Ethiopian Holiday Support**: Pre-seeded with 16 major Ethiopian and international holidays.
- **ML Calibration Layer**: Optional Gradient Boosting Regressor (`scikit-learn`) to optimize multipliers based on historical booking data (once 100+ bookings are reached).
- **Admin Dashboard**: A premium Next.js interface for real-time quote calculation and occasion management.
- **Integration**: Seamlessly integrated into the default booking flow.

## 🧮 Pricing Logic

The final price is calculated using the following formula:
`Final Price = Base Price × Occasion × Demand × Lead Time × Day-of-Week × Season`

| Factor | Description | Example |
|---|---|---|
| **Occasion** | Premium for holidays/festivals | Enkutatash (1.5x) |
| **Demand** | Adjusts based on current occupancy | >80% Full (1.2x) |
| **Lead Time** | Rewards early booking, surcharges last-minute | <3 Days (1.15x) |
| **Day of Week** | Weekend vs. Weekday adjustments | Saturday (1.1x) |
| **Seasonality** | Monthly tiers (Peak, Shoulder, Low) | September (1.15x) |

## 🛠️ Setup & Installation

### 1. Database Migration
Ensure your database is running and run the initialization script to create the new tables (`occasions`, `price_rules`):
```bash
cd KuriftuOs/backend
export PYTHONPATH=$PYTHONPATH:.
python3 init_db.py
```

### 2. Seed Pricing Data
Populate the database with the baseline rules and Ethiopian holidays:
```bash
python3 seed_pricing.py
```

### 3. Run Backend
```bash
uvicorn app.main:app --reload
```

## 🖥️ Admin Dashboard
Access the pricing management console at `/dashboard/pricing`.
- **Live Price Calculator**: See a line-by-line breakdown of how factors affect the final price.
- **Occasion Manager**: Create, edit, and delete seasonal multipliers and holidays.

## 🧪 Testing
Run the comprehensive suite of 24 unit tests:
```bash
cd KuriftuOs/backend
python3 -m pytest tests/test_pricing_engine.py -v
```

## 🏗️ Technical Stack
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL (pgvector), Scikit-Learn
- **Frontend**: Next.js 14, Tailwind CSS, Lucide React
- **ML**: Gradient Boosting Regressor (Joblib)

---
*Developed for Kuriftu Resort - Advanced Agentic Coding Project*
