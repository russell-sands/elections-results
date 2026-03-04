/// <reference types="vite/client" />
/// <reference types="@arcgis/core" />
/// <reference types="@arcgis/map-components/types/react" />

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
