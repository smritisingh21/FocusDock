# FocusDock - Amazon EC2 & AWS Cloud Deployment Guide

This guide walks you through deploying **FocusDock** to an **Amazon EC2** instance, with persistent **PostgreSQL**, in-memory **Redis** caching, and **Amazon S3** for background image uploads.

---

## 🏛️ Architecture Overview

```
                                      +------------------------+
                                      |   Amazon S3 Bucket     |
                                      | (User Wallpaper Images)|
                                      +-----------^------------+
                                                  | Upload / Read
                                                  |
 [ User Browser ] ----(Port 80/443)----> [ Nginx Reverse Proxy ]
                                                  |
                          +-----------------------+-----------------------+
                          |                                               |
                  / (Frontend SPA)                                 /api/* (Backend API)
                          |                                               |
              [ Vite Static Client ]                            [ Express Node.js Server ]
                                                                   (Port 5001)
                                                                          |
                                                  +-----------------------+-----------------------+
                                                  |                                               |
                                        [ PostgreSQL 15 ]                                [ Redis 7 Cache ]
                                      (Users, Preferences,                             (Sessions, Layouts,
                                         Todos, Notes)                                    Query Results)
```

---

## 📋 Prerequisites

1. **AWS Account** with access to EC2 and S3.
2. **EC2 Instance**:
   - **Recommended Instance Type**: `t3.small` (2 vCPU, 2 GiB RAM) or `t3.micro` (free tier eligible).
   - **OS**: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (x86_64).
   - **Storage**: 15–20 GB gp3 SSD.
3. **EC2 Security Group Rules**:
   | Type | Port Range | Protocol | Source | Purpose |
   | :--- | :--- | :--- | :--- | :--- |
   | SSH | 22 | TCP | Your IP / 0.0.0.0/0 | Remote Terminal Access |
   | HTTP | 80 | TCP | 0.0.0.0/0 | Web App Client Traffic |
   | HTTPS | 443 | TCP | 0.0.0.0/0 | Secure SSL Web Traffic |
   | Custom TCP | 5001 | TCP | 0.0.0.0/0 (or VPC only) | Direct API Access |

---

## 🪣 Step 1: Configure Amazon S3 Bucket

1. Open the [Amazon S3 Console](https://s3.console.aws.amazon.com/).
2. Click **Create bucket**.
   - **Bucket name**: e.g., `focusdock-wallpapers-prod`
   - **AWS Region**: e.g., `us-east-1`
   - **Object Ownership**: ACLs disabled (recommended)
   - **Block Public Access settings**: If you wish for uploaded wallpapers to be publicly readable, uncheck "Block all public access" or configure a CloudFront distribution.
3. Under the bucket **Permissions** tab, add the following **CORS configuration**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
4. Create an IAM User or IAM Role with the following minimal policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:PutObjectAcl"
         ],
         "Resource": "arn:aws:s3:::focusdock-wallpapers-prod/*"
       }
     ]
   }
   ```
   Save the **Access Key ID** and **Secret Access Key**.

---

## 🚀 Step 2: One-Click Deployment on EC2 (Docker Compose)

### 1. Connect to your EC2 instance via SSH:
```bash
ssh -i "your-key-pair.pem" ubuntu@ec2-XX-XX-XX-XX.compute-1.amazonaws.com
```

### 2. Clone the FocusDock Repository:
```bash
git clone https://github.com/smritisingh21/FocusDock.git
cd FocusDock
```

### 3. Create your `.env` configuration file:
```bash
cp server/.env.example .env
nano .env
```
Populate the environment variables:
```ini
NODE_ENV=production
JWT_SECRET=generate-a-secure-random-32-char-secret

# PostgreSQL Configuration
PGUSER=postgres
PGPASSWORD=YourStrongDatabasePassword123!
PGDATABASE=focusdock

# Amazon S3 Configuration
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=focusdock-wallpapers-prod

# Optional Spotify API
SPOTIFY_CLIENT_ID=3b13751937424501a606f1f858b193d2
```

### 4. Run the automated EC2 setup script:
```bash
./deploy/ec2-setup.sh
```

This script automatically:
- Installs Docker & Docker Compose.
- Configures the UFW firewall.
- Builds the production multi-stage client with Nginx.
- Launches PostgreSQL, Redis, Express API, and Nginx containers.

---

## 🔒 Step 3: Domain & Free SSL Setup (Certbot Let's Encrypt)

If pointing a custom domain (e.g. `focusdock.yourdomain.com`) to your EC2 public IP:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d focusdock.yourdomain.com
```
Certbot will automatically install the TLS certificate and configure HTTPS redirection!

---

## ⚡️ Step 4: Verification & Health Check

Verify all services from your browser or terminal:

1. **Application Interface**:
   ```
   http://<EC2_PUBLIC_IP>
   ```
2. **API & Services Health Endpoint**:
   ```bash
   curl http://<EC2_PUBLIC_IP>/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "services": {
       "database": {
         "type": "PostgreSQL",
         "connected": true,
         "mode": "production-postgresql"
       },
       "cache": {
         "type": "Redis",
         "connected": true,
         "mode": "redis-cache"
       },
       "storage": {
         "type": "Amazon S3",
         "configured": true,
         "bucket": "focusdock-wallpapers-prod",
         "region": "us-east-1"
       }
     }
   }
   ```

---

## 🛠️ Step 5: Troubleshooting & Maintenance

### View Container Logs:
```bash
# View backend logs (Express, PostgreSQL, Redis, S3 uploads)
docker compose logs -f server

# View PostgreSQL database logs
docker compose logs -f postgres

# View Redis cache logs
docker compose logs -f redis

# View Nginx client logs
docker compose logs -f client
```

### Restart Services:
```bash
docker compose restart
```

### Update Code & Re-deploy:
```bash
git pull origin main
docker compose up -d --build
```
