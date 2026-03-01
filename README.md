# Elections Viewer

An interactive web application for displaying election results and geographic data using ArcGIS mapping services and React.

## Overview

Elections Viewer is a React-based web application that displays election results with interactive maps and charts. It integrates with ArcGIS Feature Services to visualize geographic boundaries and election data.

## Prerequisites

- **Node.js** v16 or higher
- **npm** or yarn package manager
- ArcGIS Feature Service URLs for boundaries and election data

## Installation

1. **Clone or download the repository**

   ```bash
   cd elections-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Configuration

Configuration is done through environment variables. Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

### Environment Variables

Edit `.env` and configure the following variables:

| Variable                         | Description                                          | Example                                           |
| -------------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| `VITE_ELECTION_NAME`             | Display name of the election                         | "November 2025 General Election"                  |
| `VITE_JURISDICTION_NAME`         | Name of the jurisdiction                             | "City of Springfield"                             |
| `VITE_LOGO_URL`                  | URL to jurisdiction logo (optional)                  | "https://example.com/logo.png"                    |
| `VITE_LABEL_CANDIDATES`          | Custom label for candidates section (optional)       | "Candidates"                                      |
| `VITE_LABEL_BALLOT_MEASURES`     | Custom label for ballot measures (optional)          | "Measures"                                        |
| `VITE_LABEL_OTHER`               | Custom label for other content (optional)            | "Other"                                           |
| `VITE_BOUNDARIES_LAYER_URL`      | ArcGIS Feature Service URL for geographic boundaries | "https://services.arcgis.com/.../FeatureServer/0" |
| `VITE_ISSUES_REGISTRY_TABLE_URL` | ArcGIS Feature Service URL for election data         | "https://services.arcgis.com/.../FeatureServer/0" |

## Development

### Start the development server

```bash
npm run dev
```

This starts a local development server with hot module replacement (HMR). The application will be available at `http://localhost:5173` (or the next available port).

### Build for development

```bash
npm run build
```

This compiles TypeScript and bundles the application with Vite.

### Preview production build

```bash
npm run preview
```

This serves the production build locally for testing before deployment.

## Production Build

### Build the application

```bash
npm run build
```

This creates an optimized production bundle in the `dist/` directory containing:

- Minified JavaScript and CSS
- Optimized assets
- Source maps (for debugging)

### Build artifacts

- `dist/index.html` - Main HTML file
- `dist/assets/` - JavaScript, CSS, and image files
- The output is ready to be deployed to any static hosting service

## Deployment

### Static Hosting Options

#### 1. **Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Or connect your Git repository to Netlify for automatic deployments on push.

#### 2. **Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### 3. **GitHub Pages**

1. Update `vite.config.ts` if deploying to a subdirectory
2. Build the project: `npm run build`
3. Push the `dist/` folder to your GitHub Pages branch

#### 4. **AWS S3 + CloudFront**

```bash
# Build the application
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name/

# Invalidate CloudFront cache (if using CloudFront)
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### 5. **Docker Deployment**

Create a `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t elections-viewer .
docker run -p 80:80 elections-viewer
```

#### 6. **Traditional Web Server (Apache, Nginx)**

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/elections-viewer/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apache Configuration (.htaccess):**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Important Deployment Considerations

### ArcGIS Service Access

- Ensure your ArcGIS Feature Service URLs are accessible from the deployed server
- If services require authentication, configure CORS settings in ArcGIS Online
- Test connectivity to Feature Services before going live

### CORS (Cross-Origin Resource Sharing)

If ArcGIS services are on a different domain, they must allow requests from your deployment domain:

- Configure in ArcGIS Online: Services > Feature Service > CORS settings
- Add your domain to the allowed origins list

### Environment Variables in Production

- Set environment variables in your deployment platform:
  - **Netlify/Vercel**: Use the dashboard to set environment variables
  - **Docker**: Pass as build args or environment variables at runtime
  - **Traditional servers**: Create `.env` file or set via web server configuration

### Security

- Use HTTPS in production
- Keep dependencies updated: `npm audit` and `npm update`
- Store sensitive credentials in environment variables, not in code

## Troubleshooting

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Development Server Not Starting

- Check if port 5173 is available
- Try: `npm run dev -- --port 3000`

### ArcGIS Services Not Loading

- Verify URLs in `.env` are correct and accessible
- Check browser console for CORS errors
- Ensure CORS is enabled on the Feature Services
- Test URLs directly in a browser

### Blank Page After Deployment

- Check browser console for JavaScript errors
- Verify environment variables are set correctly
- Ensure `dist/` folder was deployed completely
- Clear browser cache and reload

## Project Structure

```
elections-viewer/
├── src/                    # Source TypeScript/React code
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
├── .env                   # Environment variables (not in git)
└── dist/                  # Production build output
```

## Dependencies

- **React 19** - UI framework
- **React Router 7** - Client-side routing
- **Vite 7** - Build tool and dev server
- **ArcGIS Core** - Mapping and geographic visualization
- **ArcGIS REST Services** - Integration with ArcGIS services
- **Recharts 3** - Chart components for data visualization
- **TypeScript 5** - Static typing

## License

Please see LICENSE file for details.

## Support

For issues or questions, refer to the project documentation or contact the development team.
