# Role-Based Routing Architecture

## Overview

SmartProperty uses a **role-based routing system** that redirects users to different applications based on their role after login:

- **AGENCY, OWNER, ADMIN** → Redirected to **Backoffice** (dashboard for property management)
- **TENANT, BUYER** → Stay in **Frontend** (public-facing website)

## Architecture

### Two Separate React Applications

1. **Frontend** (`frontend/`)
   - Public website
   - Login/Signup pages
   - Property browsing (for TENANT/BUYER)
   - Runs on: `http://localhost:3000`

2. **Backoffice** (`backoffice/`)
   - Admin dashboard (Berry template)
   - Property management (CRUD)
   - Portfolio & Analytics
   - Runs on: `http://localhost:3001`

### Shared Backend

- Single backend API (`backend/`)
- Both apps use the same JWT token stored in `localStorage`
- Token is shared across both applications (same domain in production)

## Flow

### Login Process

1. User logs in via **Frontend** (`/login`)
2. Backend validates credentials and returns:
   ```json
   {
     "token": "JWT_TOKEN",
     "user": {
       "role": "AGENCY" | "OWNER" | "TENANT" | "BUYER" | "ADMIN",
       ...
     }
   }
   ```
3. Frontend stores token and user data in `localStorage`
4. **Role-based redirect:**
   - If `role` ∈ `['AGENCY', 'OWNER', 'ADMIN']` → `window.location.href = BACKOFFICE_URL`
   - If `role` ∈ `['TENANT', 'BUYER']` → `navigate('/')` (stay in frontend)

### Backoffice Access

- Backoffice reads `token` from `localStorage` on load
- Axios interceptor adds `Authorization: Bearer <token>` to all requests
- Backend middleware `auth.protect` validates token and attaches `req.user`
- User can access their portfolio/properties based on role

## Files Modified

### Frontend

- `frontend/.env` - Added `REACT_APP_BACKOFFICE_URL`
- `frontend/src/utils/auth.js` - **NEW** - Role-based routing utilities
- `frontend/src/features/auth/login.jsx` - Added role-based redirect logic

### Backend

- `backend/src/controllers/userController.js` - Added `getProfile()` endpoint
- `backend/src/routes/user.routes.js` - Updated `/users/profile` route

### Backoffice

- `backoffice/src/api/smartproperty.js` - Already configured with token interceptor ✅

## API Endpoints

### Authentication

- `POST /api/users/login` - Login (returns token + user data)
- `POST /api/users/register` - Register new user
- `GET /api/users/profile` - Get current user profile (protected)

### Properties (for Backoffice)

- `GET /api/properties` - List properties (filtered by role)
- `POST /api/properties` - Create property (AGENCY/OWNER only)
- `PUT /api/properties/:id` - Update property (AGENCY/OWNER only)
- `DELETE /api/properties/:id` - Delete property (ADMIN only)

## Role Permissions

| Role | Frontend Access | Backoffice Access | Can Create Properties | Can Edit Properties | Can Delete Properties |
|------|----------------|-------------------|----------------------|---------------------|----------------------|
| **ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **AGENCY** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **OWNER** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **TENANT** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **BUYER** | ✅ | ❌ | ❌ | ❌ | ❌ |

## Environment Variables

### Frontend `.env`

```env
REACT_APP_GOOGLE_CLIENT_ID=...
REACT_APP_BACKOFFICE_URL=http://localhost:3001
```

### Backoffice `.env` (if exists)

```env
VITE_API_URL=http://localhost:5000/api
```

## Testing

1. **Test AGENCY/OWNER redirect:**
   - Login with AGENCY or OWNER account
   - Should redirect to `http://localhost:3001` (backoffice)
   - Backoffice should load with user authenticated

2. **Test TENANT/BUYER redirect:**
   - Login with TENANT or BUYER account
   - Should stay in frontend (`http://localhost:3000`)
   - Can browse properties but not access backoffice

3. **Test token sharing:**
   - Login in frontend
   - Manually navigate to `http://localhost:3001`
   - Backoffice should recognize the token and show authenticated state

## Next Steps

- [ ] Add route guards in backoffice to redirect to frontend login if no token
- [ ] Add logout functionality that clears token from both apps
- [ ] Implement property filtering by role in backend (AGENCY sees managed, OWNER sees own)
- [ ] Add user profile page in backoffice
- [ ] Add "Switch to Dashboard" link in frontend header for AGENCY/OWNER users
