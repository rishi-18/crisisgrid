# 🚨 CrisisGrid — Disaster Resource Coordination Platform

CrisisGrid is a high-fidelity, real-time command-and-control platform designed for disaster response team. It enables coordinators and operators to track inventories, dispatch volunteers, and visualize resource gaps across affected zones.

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+
- **MongoDB Atlas**: A connection string (URI)
- **Git**

### 2. Installation
Clone the repository and install dependencies for both client and server:
```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_key
```

### 4. Database Seeding
Populate the database with realistic demo data (Camps in Delhi, Jaipur, Agra, Lucknow):
```bash
cd server
npm run seed
```

### 5. Running the Application
Open two terminals:
- **Terminal 1 (Server)**: `cd server && npm run dev`
- **Terminal 2 (Client)**: `cd client && npm run dev`

Access the portal at `http://localhost:5173` (default Vite port).

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Client [React Frontend]
        A[App.jsx] --> B[AuthContext]
        A --> C[ProtectedRoute]
        C --> D[Dashboard/Map]
        C --> E[Inventory Matrix]
        C --> F[Gap Analytics]
        G[Axios Interceptors] -->|JWT| H[Express API]
    end

    subgraph Server [Node/Express Backend]
        H --> I[Auth Middleware]
        I --> J[Camp Controller]
        I --> K[Analytics Controller]
    }

    subgraph Database [MongoDB Atlas]
        J --> L[(Camps)]
        K --> M[(Needs/Alerts)]
    end
```

---

## 🍃 MongoDB Concepts Demonstrated

The platform serves as a production-grade demonstration of advanced MongoDB features:

| Concept | File/Route | Description |
| :--- | :--- | :--- |
| **2dsphere Index** | `models/Camp.js` | Enables geospatial storage for longitude/latitude pairs. |
| **$near Operator** | `routes/camps.js` | Calculated real-world distances to return the nearest 5 camps to a user. |
| **Aggregation Pipeline** | `routes/analytics.js` | A 6-stage pipeline ($unwind, $group, $lookup, $addFields) for gap analysis. |
| **Sparse Index** | `models/Alert.js` | Optimizes queries for "unresolved" alerts while keeping the index compact. |
| **TTL Index** | `models/Alert.js` | Automatically expires and deletes emergency alerts after 7 days. |
| **arrayFilters** | `routes/camps.js` | Atomic updates to specific resource types inside the nested inventory array. |
| **Compound Index** | `models/Need.js` | Optimized filtering for `{ zone, resourceType, urgency }` combinations. |

---

## 🛡️ Security & Roles
1. **Coordinator**: Full platform visibility, analytics, and volunteer dispatching powers.
2. **Operator**: Restricted to managing the inventory of their specific assigned relief camp.
3. **Field Worker**: Public read-access to find nearest camps and relief status.

Developed with ❤️ for Advanced Disaster Response.
