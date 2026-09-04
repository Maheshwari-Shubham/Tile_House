# 🚀 Tile House — Deployment Guide

This guide shows how to deploy Tile House to production using popular hosting platforms.

---

## 📋 Pre-Deployment Checklist

- [ ] Backend `.env` file created with production values
- [ ] Frontend `.env.local` file created with production API URL
- [ ] MongoDB Atlas account created (or production MongoDB instance)
- [ ] Cloudinary unsigned upload preset configured
- [ ] Resend account and verified sender created (recommended for Render email)
- [ ] All changes committed to Git (except `.env` files)

---

## 🔒 Security: Never Commit `.env` Files

**IMPORTANT:** The `.env` files contain secrets and should NEVER be committed to Git.

Check your `.gitignore`:
```
backend/.env
frontend/.env.local
node_modules/
.DS_Store
```

---

## 📱 Option 1: Deploy to Vercel (Recommended for Full Stack)

### Backend → Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com and sign up
   - Connect your GitHub repository

2. **Configure Backend as Serverless Function**
   - Create `backend/vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "server.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "server.js" }]
   }
   ```

3. **Set Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add all variables from `backend/.env.example`:
     ```
     MONGODB_URI = your-mongodb-atlas-uri
     JWT_SECRET = your-secret
     USER_JWT_SECRET = your-secret
     CLOUDINARY_CLOUD_NAME = your-cloud-name
     CLOUDINARY_UPLOAD_PRESET = tile_house_unsigned
     EMAIL_SERVICE = gmail
     EMAIL_USER = your-email@gmail.com
     EMAIL_PASS = your-app-password
     ```

4. **Deploy**
   - Push to main branch or manually deploy via Vercel dashboard
   - Backend URL will be: `https://your-vercel-domain.vercel.app`

### Frontend → Vercel

1. **Update Frontend Environment**
   - Create `frontend/.env.production`:
   ```
   REACT_APP_API_URL=https://your-vercel-domain.vercel.app/api
   ```

2. **Deploy Frontend**
   - Vercel automatically detects React app
   - Frontend builds and deploys automatically

3. **Deploy via Git**
   ```bash
   git add .
   git commit -m "chore: production deployment config"
   git push origin main
   ```

---

## 🗄️ Option 2: Backend on Railway + Frontend on Vercel

### Backend → Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Connect GitHub repo

2. **Deploy Backend**
   - Select Node.js environment
   - Railway auto-detects `server.js`

3. **Set Environment Variables**
   - In Railway dashboard: Variables
   - Add all from `.env.example`
   - Railway provides public URL automatically

4. **Update Frontend**
   ```
   REACT_APP_API_URL=https://your-railway-url/api
   ```

### Frontend → Vercel (same as above)

---

## 🐳 Option 3: Docker Deployment (for VPS/Self-Hosted)

### Create Dockerfile

**backend/Dockerfile**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**frontend/Dockerfile**:
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build & Run
```bash
cd backend
docker build -t tile-house-backend .
docker run -p 5000:5000 --env-file .env tile-house-backend

cd ../frontend
docker build -t tile-house-frontend .
docker run -p 80:80 tile-house-frontend
```

---

## 📊 Post-Deployment Testing

### Test Backend
```bash
curl https://your-backend-url/api/products
# Should return: [...]
```

### Test Frontend
- Open https://your-frontend-url in browser
- Try: Login → Add Product → Upload Image → Place Order
- Check admin dashboard

### Configure Email on Render

Render commonly times out direct SMTP connections. Use Resend's HTTPS API for production:

1. Create an account at https://resend.com and verify the domain or sender email you will use.
2. Create a Resend API key.
3. In the Render backend service, add these environment variables:
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxx
   RESEND_FROM=Tile House <noreply@your-verified-domain.com>
   ```
4. Save the variables and redeploy the backend.
5. Open `/admin`, go to Settings, and click **Send Test Email**.

`RESEND_FROM` must use the exact email address or domain verified in Resend. The Gmail settings can remain in the database for display, but they are not used when `EMAIL_PROVIDER=resend`.

### Verify MongoDB Connection
```bash
# In backend logs, you should see:
# ✅ MongoDB Connected: your-cluster.mongodb.net
```

### Verify Cloudinary Upload
- In admin dashboard: Add Product → Upload Image
- Should upload successfully and show preview

---

## 🔧 Environment Variables Reference

| Variable | Example | Notes |
|----------|---------|-------|
| `MONGODB_URI` | `mongodb+srv://...` | Use MongoDB Atlas for production |
| `JWT_SECRET` | `openssl rand -base64 32` | Generate strong random secret |
| `REACT_APP_API_URL` | `https://api.yourdomain.com` | Backend URL for frontend |
| `CLOUDINARY_UPLOAD_PRESET` | `tile_house_unsigned` | Create in Cloudinary dashboard |
| `EMAIL_PROVIDER` | `resend` | Use `smtp` only when the hosting provider permits SMTP |
| `RESEND_API_KEY` | `re_...` | Resend API key; keep it secret |
| `RESEND_FROM` | `Tile House <noreply@example.com>` | Must be a verified Resend sender |
| `EMAIL_PASS` | Gmail app password | Used only with `EMAIL_PROVIDER=smtp` |

---

## 🐛 Troubleshooting

### "Cannot POST /api/upload" (Frontend can't reach backend)
- **Solution**: Check `REACT_APP_API_URL` is correct and backend is running

### "MongoDB Error: connection refused"
- **Solution**: Verify `MONGODB_URI` in production, check firewall/security groups

### "Cloudinary upload fails"
- **Solution**: Verify `CLOUDINARY_UPLOAD_PRESET` is set to Unsigned mode

### "Email not sending"
- **Render**: Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `RESEND_FROM`, then redeploy.
- **Resend 403/422**: Verify that `RESEND_FROM` exactly matches a verified sender/domain.
- **Local SMTP**: Use a Gmail app password, not a regular password. Enable 2FA first.

---

## 📝 Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] MongoDB Atlas connection tested
- [ ] Cloudinary unsigned preset created
- [ ] Frontend `.env.production` points to correct backend URL
- [ ] CORS properly configured (no `*` wildcard in production)
- [ ] Error handling tested (try invalid login, etc.)
- [ ] Image uploads tested end-to-end
- [ ] Orders workflow tested
- [ ] Admin dashboard tested
- [ ] Mobile responsiveness verified

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://railway.app/docs
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

Happy deploying! 🚀
