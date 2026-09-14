# 🏛️ Archaeological Excavation Records System

A full-stack MERN (MongoDB, Express, React, Node.js) web application designed for archaeological research teams, field directors, and conservators to document, catalog, and analyze excavation sites, artifacts, field journal logs, and research teams.

---

## ✨ Features

- **🏛️ Excavation Sites Management**: Document site codes, geographical coordinates, historical eras/periods, condition assessments, and teams.
- **🏺 Artifact Cataloging**: Record discoveries with accession numbers, stratum layers, materials, dimensions, high-resolution imagery, and conservation status.
- **📖 Stratigraphic Field Journals**: Keep detailed daily excavation logs, trench numbers, soil matrix notes, weather conditions, and photo attachments.
- **👥 Role-Based Access Control (RBAC)**:
  - **Admin**: Full system management, user role management, system settings.
  - **Lead Archaeologist**: Create and manage sites, artifacts, excavation logs, and assign site teams.
  - **Field Assistant**: Register artifacts and record daily excavation logs.
  - **Viewer**: Read-only access to explore public archaeological records and research data.
- **📊 Real-time Analytics Dashboard**: Excavation metrics, artifact discovery distributions, period breakdowns, and site status tracking.
- **🗺️ Interactive Map Explorer**: Geographic visualization of excavation field locations.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **React Router v6**
- **TanStack React Query v5**
- **Lucide Icons**
- **Leaflet & React-Leaflet** (Map visualization)
- **Axios**

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose**
- **JWT (JSON Web Tokens)** & bcryptjs authentication
- **Multer** (Local file uploads)
- **Express Rate Limit & Helmet** (Security)

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` (or MongoDB Atlas connection string)

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
# Copy .env.example to .env and adjust if needed
cp .env.example .env

# (Optional) Seed the database with sample archaeological data
npm run seed

# Start development server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start development server (runs on http://localhost:5173)
npm run dev
```

---

## 🔒 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/archaeological_records
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
UPLOAD_MODE=local
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000
```

---

## 📁 Project Structure

```
├── backend/
│   ├── config/         # Database and server configuration
│   ├── controllers/    # API controllers (auth, sites, artifacts, logs, users)
│   ├── middleware/     # Auth, RBAC, file upload, and error middleware
│   ├── models/         # Mongoose models (User, Site, Artifact, Log)
│   ├── routes/         # Express REST API routes
│   ├── seed/           # Initial database seeder scripts
│   └── server.js       # Backend entry point
├── frontend/
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # Reusable UI components (Navbar, Sidebar, etc.)
│   │   ├── context/    # Auth, Theme, and Notification contexts
│   │   ├── pages/      # Application views (Dashboard, Sites, Artifacts, Logs)
│   │   ├── services/   # Axios API client functions
│   │   └── App.jsx     # Root router and layout definition
└── .gitignore          # Root ignore rules for node_modules and .env files
```

---

## 📄 License
This project is licensed under the MIT License.
