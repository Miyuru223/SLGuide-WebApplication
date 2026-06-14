# 🇱🇰 SLGuide — Sri Lanka Tourist Guide

A full-stack MERN web application for tourists to discover Sri Lanka's historical destinations and hotels.

## Features

### Public (No Login Required)
- 🏠 **Home Page** — Hero section, featured destinations & hotels, stats
- 🏛️ **Destinations** — Browse & search historical sites with category filters
- 🏨 **Hotels** — Browse & search accommodations with star & category filters
- 🔍 **Detail Pages** — Full info, photo galleries, opening hours, pricing
- 📱 Responsive design for mobile & desktop

### Admin Panel
- 🔐 **Secure Login** — JWT-based authentication (username: `admin`, password: `admin123`)
- 📊 **Dashboard** — Stats overview and recent entries
- 🏛️ **Manage Destinations** — Add, edit, delete with photo uploads
- 🏨 **Manage Hotels** — Add, edit, delete with amenities & photos
- ⭐ **Featured Toggle** — Mark items to appear on homepage

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| File Upload | Multer |
| HTTP Client | Axios |

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas URI)
- npm

---

### 1. Clone / Extract the Project

```bash
cd slguide
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/slguide
JWT_SECRET=slguide_super_secret_key_2024
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

> **MongoDB Atlas:** Replace `MONGODB_URI` with your Atlas connection string.

Start the backend:
```bash
npm run dev
# OR for production:
npm start
```

Backend runs at: **http://localhost:5000**

---

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

### 4. Run Both Together (from root)

```bash
# From the /slguide root folder:
npm install        # installs concurrently
npm run dev        # runs both servers simultaneously
```

---

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/verify` | Verify token |

### Destinations (public GET, admin POST/PUT/DELETE)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/destinations` | All destinations (supports `?search=`, `?category=`, `?district=`) |
| GET | `/api/destinations/featured` | Featured destinations |
| GET | `/api/destinations/:id` | Single destination |
| POST | `/api/destinations` | Create (admin) |
| PUT | `/api/destinations/:id` | Update (admin) |
| DELETE | `/api/destinations/:id` | Delete (admin) |

### Hotels (public GET, admin POST/PUT/DELETE)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/hotels` | All hotels (supports `?search=`, `?category=`, `?district=`, `?stars=`) |
| GET | `/api/hotels/featured` | Featured hotels |
| GET | `/api/hotels/:id` | Single hotel |
| POST | `/api/hotels` | Create (admin) |
| PUT | `/api/hotels/:id` | Update (admin) |
| DELETE | `/api/hotels/:id` | Delete (admin) |

---

## Admin Access

Navigate to: **http://localhost:3000/admin/login**

Default credentials:
- **Username:** `admin`
- **Password:** `admin123`

> Change these in the backend `.env` file for production.

---

## Project Structure

```
slguide/
├── backend/
│   ├── models/
│   │   ├── Destination.js
│   │   └── Hotel.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── destinations.js
│   │   └── hotels.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── uploads/          ← photo files stored here
│   ├── server.js
│   ├── .env              ← create this
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── AdminSidebar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Toast.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Destinations.js
│   │   │   ├── DestinationDetail.js
│   │   │   ├── Hotels.js
│   │   │   ├── HotelDetail.js
│   │   │   ├── AdminLogin.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminDestinations.js
│   │   │   └── AdminHotels.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── package.json
└── README.md
```

---

## Destination Categories
- Ancient City, Temple, Natural Wonder, Beach, Fort, Museum, Cultural Site, Wildlife

## Hotel Categories
- Luxury, Boutique, Budget, Resort, Guesthouse, Heritage

---

## Production Deployment

1. **Frontend:** Build with `npm run build` in `/frontend`, serve the `build/` folder
2. **Backend:** Deploy to any Node.js host (Railway, Render, DigitalOcean)
3. **Database:** Use MongoDB Atlas for cloud hosting
4. **Images:** Consider AWS S3 or Cloudinary for production file storage
5. **Environment:** Set strong `JWT_SECRET` and change default admin credentials

---

Made with ❤️ for Sri Lanka 🇱🇰
