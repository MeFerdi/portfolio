# Deployment Guide

This portfolio application is configured for deployment on Fly.io using Docker.

## Prerequisites

1. Install the Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Sign up for a Fly.io account: https://fly.io/app/sign-up
3. Authenticate with Fly: `fly auth login`

## Deployment Steps

### Initial Setup (First time only)

1. **Launch the app on Fly.io:**
   ```bash
   fly launch
   ```
   - This will use the existing `fly.toml` configuration
   - Choose your app name (or keep the existing one: `ferdportfolio`)
   - Select your preferred region

### Deploy Updates

1. **Deploy your application:**
   ```bash
   npm run deploy
   ```
   
   Or directly:
   ```bash
   fly deploy
   ```

### Configuration Details

- **Port:** Application runs on port 3000 inside the container
- **Health Check:** Available at `/api/health`
- **Environment:** Production mode with Node.js 18
- **Memory:** 1GB allocated with auto-scaling
- **SSL:** Automatically enabled with force HTTPS

### Environment Variables (if needed)

Set environment variables using:
```bash
fly secrets set VARIABLE_NAME=value
```

### Monitoring

- **Logs:** `fly logs`
- **Status:** `fly status`
- **Open app:** `fly open`

### Troubleshooting

1. **Build issues:** Check the Dockerfile and ensure all dependencies are in package.json
2. **Runtime issues:** Check logs with `fly logs`
3. **Health check failures:** Verify the health endpoint at `/api/health`

## Local Testing

Test the Docker build locally:
```bash
docker build -t portfolio .
docker run -p 3000:3000 portfolio
```

Then visit http://localhost:3000 to verify everything works.
