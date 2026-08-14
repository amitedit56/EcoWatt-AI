# ⚡ EcoWatt AI

> An AI-powered energy monitoring and efficiency platform that helps users understand electricity consumption, detect abnormal energy usage, and make smarter energy decisions.

[![Live Demo](https://img.shields.io/badge/Live-Demo-00C853?style=for-the-badge)](https://eco-watt-ai-three.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Deployment](https://img.shields.io/badge/Deployed-Vercel%20%2B%20Render-black?style=for-the-badge)](https://vercel.com/)

---

## 🚀 Live Deployment

### 🌐 Frontend

**EcoWatt AI Web Application**

👉 https://eco-watt-ai-three.vercel.app

### ⚙️ Backend API

**FastAPI Backend**

👉 https://ecowatt-ai.onrender.com

### 📚 API Documentation

Once the backend is running, FastAPI provides interactive API documentation:

- Swagger UI: `https://ecowatt-ai.onrender.com/docs`
- ReDoc: `https://ecowatt-ai.onrender.com/redoc`

> Replace the backend URL above if your Render service uses a different URL.

---

# 🌱 About EcoWatt AI

**EcoWatt AI** is a full-stack AI-powered energy monitoring application designed to help users analyze electricity consumption and improve energy efficiency.

The platform combines a modern React frontend, FastAPI backend, PostgreSQL database, authentication, analytics, and machine-learning-based anomaly detection to provide an interactive energy management experience.

### 🎯 Main Goals

- Monitor energy consumption
- Analyze electricity usage patterns
- Detect abnormal consumption
- Provide data-driven energy insights
- Help users identify inefficient energy usage
- Visualize energy-related data through interactive dashboards
- Provide secure user authentication

---

# ✨ Features

## 📊 Energy Dashboard

- Interactive energy consumption dashboard
- Consumption statistics
- Energy usage trends
- Data visualization
- Dynamic dashboard information

---

## 🤖 AI-Powered Anomaly Detection

EcoWatt AI uses machine learning to identify unusual energy consumption patterns.

The system can help detect:

- Unexpected spikes in consumption
- Unusual usage patterns
- Potential energy inefficiencies
- Abnormal consumption behavior

---

## 🔮 Energy Forecasting

The application includes forecasting functionality to analyze historical energy data and estimate future consumption trends.

---

## 🔐 Authentication

Secure authentication system with:

- User registration
- Email/password login
- JWT-based authentication
- Password reset functionality
- Google Sign-In
- Protected dashboard routes

---

## 📈 Analytics

- Energy consumption analysis
- Historical data visualization
- Usage trends
- Energy statistics
- Interactive charts

---

## 🎨 Modern UI

- Responsive dashboard
- Dark-themed interface
- Modern card-based layout
- Interactive components
- Responsive navigation
- Clean and minimal design

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │        User         │
                    │     Web Browser     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    React + Vite     │
                    │      Frontend       │
                    │       Vercel        │
                    └──────────┬──────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │       Backend       │
                    │       Render        │
                    └──────┬───────┬──────┘
                           │       │
                  ┌────────┘       └─────────┐
                  ▼                          ▼
        ┌─────────────────┐        ┌─────────────────┐
        │   PostgreSQL    │        │    ML Models    │
        │      Neon       │        │                 │
        │                 │        │ Anomaly Model  │
        └─────────────────┘        │ Prophet Model  │
                                   └─────────────────┘
