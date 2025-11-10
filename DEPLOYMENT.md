# AnonCorkboardThree - Netlify Deployment Guide

## Netlify Deployment Instructions

This project is configured for deployment on Netlify using the Netlify CLI.

### Prerequisites

1. **Install Netlify CLI** (if not already installed):
   ```powershell
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```powershell
   netlify login
   ```

### Deployment Steps

#### First Time Deployment

1. **Build the project locally**:
   ```powershell
   npm install
   npm run build
   ```

2. **Initialize Netlify site**:
   ```powershell
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your Netlify team
   - Enter a site name (or leave blank for auto-generated)

3. **Deploy**:
   ```powershell
   netlify deploy --prod
   ```

#### Subsequent Deployments

For updates, simply run:
```powershell
npm run build
netlify deploy --prod
```

### Build Configuration

The project is configured with:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node.js Version**: 18

### Features Configured

- ✅ **SPA Routing**: Redirects configured for React Router
- ✅ **Security Headers**: XSS protection, frame options, etc.
- ✅ **Asset Caching**: Static assets cached for 1 year
- ✅ **Build Optimization**: Vite production build

### Environment Variables

If your project needs environment variables, add them in:
1. Netlify Dashboard → Site Settings → Environment Variables
2. Or via CLI: `netlify env:set VARIABLE_NAME value`

### Project Structure

```
├── src/                    # Source code
├── public/                 # Static assets
├── dist/                   # Built files (auto-generated)
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies and scripts
└── vite.config.ts         # Vite configuration
```

### Troubleshooting

- **Build fails**: Check `npm run build` works locally first
- **Routing issues**: Ensure `netlify.toml` redirects are configured
- **Assets not loading**: Verify build outputs to `dist/` folder
- **Environment issues**: Check Node.js version matches (18)

### Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase
- **Deployment**: Netlify