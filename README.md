# Elections Viewer

An interactive web application for displaying election results and geographic data using ArcGIS mapping services and React.

## Overview

Elections Viewer is a React-based web application that displays election results with interactive maps and charts. It integrates with ArcGIS Feature Services to visualize geographic boundaries and election data.

## Getting Started

### Prerequisites

- **Node.js** v16 or higher
- ArcGIS Feature Service URLs for boundaries and election data

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure the following variables:

| Variable                         | Description                                          |
| -------------------------------- | ---------------------------------------------------- |
| `VITE_ELECTION_NAME`             | Display name of the election                         |
| `VITE_JURISDICTION_NAME`         | Name of the jurisdiction                             |
| `VITE_LOGO_URL`                  | URL to jurisdiction logo (optional)                  |
| `VITE_LABEL_CANDIDATES`          | Custom label for candidates section (optional)       |
| `VITE_LABEL_BALLOT_MEASURES`     | Custom label for ballot measures (optional)          |
| `VITE_LABEL_OTHER`               | Custom label for other content (optional)            |
| `VITE_BOUNDARIES_LAYER_URL`      | ArcGIS Feature Service URL for geographic boundaries |
| `VITE_ISSUES_REGISTRY_TABLE_URL` | ArcGIS Feature Service URL for election data         |

### Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Dependencies

- **React 19** - UI framework
- **React Router 7** - Client-side routing
- **Vite 7** - Build tool and dev server
- **ArcGIS Core** - Mapping and geographic visualization
- **ArcGIS REST Services** - Integration with ArcGIS services
- **Recharts 3** - Chart components for data visualization
- **TypeScript 5** - Static typing

## License

This project is licensed under the terms described in [LICENSE.txt](LICENSE.txt).
