#!/usr/bin/env bash
# ==============================================================================
# FocusDock - Amazon EC2 Automated Setup & Deployment Script
# Supports: Ubuntu 22.04 / 24.04 LTS & Amazon Linux 2023
# ==============================================================================

set -e

echo "🚀 Starting FocusDock EC2 Provisioning..."

# 1. Update OS packages
echo "📦 Updating system packages..."
if [ -f /etc/debian_version ]; then
    sudo apt-get update -y && sudo apt-get upgrade -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw
elif [ -f /etc/redhat-release ] || [ -f /etc/system-release ]; then
    sudo dnf update -y
    sudo dnf install -y git curl
fi

# 2. Install Docker & Docker Compose Plugin
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed successfully"
fi

# 3. Configure UFW Firewall (Ubuntu)
if command -v ufw &> /dev/null; then
    echo "🛡️ Configuring Firewall..."
    sudo ufw allow 22/tcp comment 'SSH'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'
    sudo ufw allow 5001/tcp comment 'FocusDock API'
    sudo ufw --force enable
fi

# 4. Check for .env file
if [ ! -f .env ]; then
    echo "⚠️ .env file not found in current directory. Creating from server/.env..."
    if [ -f server/.env ]; then
        cp server/.env .env
    elif [ -f server/.env.example ]; then
        cp server/.env.example .env
    fi
    echo "💡 Please edit .env with your Amazon S3 and PostgreSQL credentials if needed."
fi

# 5. Build and launch services with Docker Compose
echo "🚢 Launching FocusDock with Docker Compose (PostgreSQL, Redis, Express API, Vite/Nginx)..."
docker compose down || true
docker compose up -d --build

echo ""
echo "=============================================================================="
echo "🎉 FocusDock is now running on Amazon EC2!"
echo "🌐 Open your EC2 Public IP or Domain in the browser: http://$(curl -s http://checkip.amazonaws.com || echo 'YOUR_EC2_PUBLIC_IP')"
echo "📡 Check API Health: http://$(curl -s http://checkip.amazonaws.com || echo 'YOUR_EC2_PUBLIC_IP')/api/health"
echo "=============================================================================="
