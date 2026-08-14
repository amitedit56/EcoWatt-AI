# ⚡ EcoWatt AI

<div align="center">

### *Smart Energy Monitoring & Machine Learning-Powered Anomaly Detection*

An end-to-end full-stack platform designed to analyze electricity consumption, detect abnormal energy spikes, forecast future demand, and empower users to make data-driven, energy-efficient decisions.

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-00C853?style=for-the-badge&logo=vercel&logoColor=white)](https://eco-watt-ai-three.vercel.app)
[![API Status](https://img.shields.io/badge/API-Render-009688?style=for-the-badge&logo=render&logoColor=white)](https://ecowatt-ai.onrender.com/docs)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

</div>

---

## 📸 Screenshots & UI Preview

<div align="center">

### 📊 Main Dashboard & Real-Time Monitoring
<img width="1896" height="863" alt="Screenshot 2026-08-14 212512" src="https://github.com/user-attachments/assets/d1f6e133-919d-4fda-bdb0-02a9ed819f22" />


<br/><br/>

| 🤖 AI Anomaly Detection | 🔮 Predictive Forecasting |
| :---: | :---: |
| <img width="1914" height="855" alt="Screenshot 2026-08-14 212532" src="https://github.com/user-attachments/assets/c324d9bd-79d8-4287-ad3e-f6b6422daf0a" />
| <img width="1897" height="860" alt="Screenshot 2026-08-14 212522" src="https://github.com/user-attachments/assets/8a1e88d8-86a6-4f1c-a16d-70e1f3769900" />
| <img width="1896" height="859" alt="Screenshot 2026-08-14 212623" src="https://github.com/user-attachments/assets/af93bb6c-b6d4-416c-ab03-1f351bacb0af" />
| <img width="1900" height="865" alt="Screenshot 2026-08-14 212632" src="https://github.com/user-attachments/assets/eb220034-53c3-4172-a205-1a010ab03f4b" />



| 🔐 Authentication & Profile | 📈 Historical Analytics | 
| :---: | :---: |
| <img width="1888" height="848" alt="Screenshot 2026-08-14 211620" src="https://github.com/user-attachments/assets/8d5ca64d-251d-40c6-a087-26a358a63782" />
| <img width="1910" height="856" alt="Screenshot 2026-08-14 212642" src="https://github.com/user-attachments/assets/10570a78-0c7d-43cb-a4f7-42135617e15f" />
| <img width="1901" height="862" alt="Screenshot 2026-08-14 212649" src="https://github.com/user-attachments/assets/2e4d4537-dc80-443d-ad3a-11a3d8fdc1da" />


</div>

---

## 🌐 Live Deployments & API Docs

| Service | Platform | URL |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | [eco-watt-ai-three.vercel.app](https://eco-watt-ai-three.vercel.app) |
| **Backend REST API** | Render | [ecowatt-ai.onrender.com](https://ecowatt-ai.onrender.com) |
| **Interactive API Docs** | Swagger UI | [ecowatt-ai.onrender.com/docs](https://ecowatt-ai.onrender.com/docs) |
| **Alternative Docs** | ReDoc | [ecowatt-ai.onrender.com/redoc](https://ecowatt-ai.onrender.com/redoc) |

---

## 💡 About EcoWatt AI

Traditional energy management often relies on delayed monthly utility bills with zero actionable insights. **EcoWatt AI** bridges this gap by combining modern cloud infrastructure with Machine Learning algorithms:

- **Real-Time Analytics:** Continuous tracking of load profiles, active metrics, and peak usage periods.
- **Intelligent Anomaly Detection:** Automated isolation of irregular power spikes, unexpected baseline loads, or faulty equipment patterns.
- **Predictive Forecasting:** Historical time-series models estimating upcoming power usage to prevent surprise billings.

---

## ✨ Key Features

- 📊 **Dynamic Energy Dashboard:** Real-time visualization of consumption metrics, trends, and aggregate consumption statistics.
- 🤖 **AI-Driven Anomaly Detection:** Identifies statistical outliers and abnormal spikes across usage patterns using machine learning.
- 🔮 **Energy Forecasting:** Employs time-series forecasting (e.g., Prophet / regression models) for accurate future consumption projections.
- 🔐 **Robust Authentication:** Secure JWT-based auth flow, email/password registration, password recovery, and Google OAuth integration.
- 📈 **Interactive Visualizations:** Sleek charts for day/week/month comparisons, peak load tracking, and historical metrics.
- 🎨 **Modern Dark-Themed UI:** Built with clean component hierarchy, modern cards, and full responsive support across desktop and mobile.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js / Recharts |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic, SQLAlchemy |
| **Machine Learning** | Scikit-Learn, Facebook Prophet, Pandas, NumPy |
| **Database & Auth** | PostgreSQL (Neon Serverless), OAuth 2.0 / JWT |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 🏗️ System Architecture

```text
 ┌─────────────────────────────────────────────────────────┐
 │                       Client Layer                      │
 │               React + Vite SPA (Vercel)                 │
 └────────────────────────────┬────────────────────────────┘
                              │
                        REST API (HTTPS)
                              │
 ┌────────────────────────────▼────────────────────────────┐
 │                     Application Layer                   │
 │                     FastAPI (Render)                    │
 └──────────────┬───────────────────────────┬──────────────┘
                │                           │
         Async Queries               Inference Calls
                │                           │
 ┌──────────────▼──────────┐ ┌──────────────▼──────────────┐
 │      Database Layer     │ │          ML Engine          │
 │   PostgreSQL (Neon)     │ │  • Anomaly Detector (ML)    │
 │  • User Auth & Profiles │ │  • Prophet Time-Series      │
 │  • Energy Time-Series   │ │    Forecasting              │
 └─────────────────────────┘ └─────────────────────────────┘
```

---

## 📂 Project Structure

```bash
EcoWatt-AI/
├── assets/                  # UI Screenshots & images for README
│   ├── dashboard-preview.png
│   ├── anomaly-detection.png
│   ├── forecasting-analytics.png
│   └── auth-screen.png
├── frontend/                # React + Vite application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI widgets & charts
│   │   ├── pages/           # Dashboard, Analytics, Login, Register
│   │   ├── services/        # API client & axios instances
│   │   └── App.jsx
│   └── package.json
│
├── backend/                 # FastAPI service
│   ├── app/
│   │   ├── api/             # Route handlers (auth, energy, ml)
│   │   ├── core/            # Configs, DB sessions, security
│   │   ├── ml_models/       # Model artifacts & inference scripts
│   │   ├── models/          # SQLAlchemy database models
│   │   └── schemas/         # Pydantic validation schemas
│   ├── requirements.txt
│   └── main.py
└── README.md
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js (v18+) & npm/yarn
- Python (v3.10+) & pip
- PostgreSQL instance (local or hosted like Neon)

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-username/eco-watt-ai.git
cd eco-watt-ai/backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run FastAPI development server
uvicorn main:app --reload --port 8000
```

> Backend will start at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`)

---

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

> Frontend will start at: `http://localhost:5173`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@host/database_name
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🤝 Contributing

Contributions are always welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
