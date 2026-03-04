import { useRef, useCallback } from "react";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-legend";
import type MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import * as predominanceRendererCreator from "@arcgis/core/smartMapping/renderers/predominance";
import Field from "@arcgis/core/layers/support/Field";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import type { ComputedIssue, Boundary } from "../../types/election";
import styles from "./ResultsMap.module.css";

interface ResultsMapProps {
  issue: ComputedIssue;
  boundaries: Boundary[];
  spatialReference: { wkid: number; latestWkid?: number };
}

/** Sanitize a label for use as an ArcGIS field name (alphanumeric + underscore, max 64 chars). */
function toFieldName(label: string): string {
  return label.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 64);
}

export default function ResultsMap({
  issue,
  boundaries,
  spatialReference,
}: ResultsMapProps) {
  const mapRef = useRef<HTMLElement | null>(null);

  const handleViewReady = useCallback(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const boundaryMap = new Map(boundaries.map((b) => [b.globalId, b]));
    const sr = new SpatialReference(spatialReference);

    const outcomeFieldDefs = issue.outcomeFields.map((o) => ({
      label: o.label,
      fieldName: toFieldName(o.label),
      sourceField: o.field,
    }));

    // Build fields using class instances
    const fields = [
      new Field({ name: "ObjectID", alias: "ObjectID", type: "oid" }),
      new Field({ name: "boundary_name", alias: "Boundary", type: "string" }),
      ...outcomeFieldDefs.map(
        (f) =>
          new Field({ name: f.fieldName, alias: f.label, type: "integer" }),
      ),
    ];

    // Build graphics with proper Polygon geometry instances
    const graphics: Graphic[] = [];
    let idx = 0;

    for (const row of issue.voteRows) {
      const boundary = boundaryMap.get(row.boundaryId);
      if (!boundary?.geometry) continue;

      const attributes: Record<string, string | number> = {
        ObjectID: idx++,
        boundary_name: boundary.internalId ?? row.boundaryId,
      };

      for (const f of outcomeFieldDefs) {
        attributes[f.fieldName] = row.outcomes[f.sourceField] ?? 0;
      }

      const geomJson = boundary.geometry as unknown as Record<string, unknown>;
      const polygon = new Polygon({
        rings: geomJson.rings as number[][][],
        spatialReference: sr,
      });

      graphics.push(new Graphic({ geometry: polygon, attributes }));
    }

    if (graphics.length === 0) return;

    // Build popup content
    const popupContent = outcomeFieldDefs
      .map((f) => `<b>${f.label}:</b> {${f.fieldName}}`)
      .join("<br>");

    const layer = new FeatureLayer({
      source: graphics,
      objectIdField: "ObjectID",
      fields,
      geometryType: "polygon",
      spatialReference: sr,
      popupTemplate: new PopupTemplate({
        title: "{boundary_name}",
        content: popupContent,
      }),
      renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: [0, 0, 0, 0],
          outline: { color: "black", width: 1.5 },
        }),
      }),
    });

    // Access the map component's map and view
    const el = mapElement as unknown as {
      map: { add: (layer: FeatureLayer) => void };
      view: { goTo: (target: unknown) => void };
    };

    el.map.add(layer);

    const predominanceFields = outcomeFieldDefs.map((f) => ({
      name: f.fieldName,
      label: f.label,
    }));

    // Once layer is ready, apply predominance renderer and zoom to extent
    layer.when(async () => {
      const response = await predominanceRendererCreator.createRenderer({
        layer,
        view: el.view as unknown as MapView,
        fields: predominanceFields,
        includeOpacityVariable: true,
        legendOptions: {
          title: issue.registry.issueName,
        },
      });

      layer.renderer = response.renderer;

      const result = await layer.queryExtent();
      if (result.extent) {
        el.view.goTo(result.extent.expand(1.2));
      }
    });
  }, [issue, boundaries, spatialReference]);

  return (
    <arcgis-map
      ref={(el: HTMLElement | null) => {
        mapRef.current = el;
      }}
      className={styles.map}
      basemap="gray-vector"
      onarcgisViewReadyChange={handleViewReady}
    >
      <arcgis-legend slot="top-left" legendStyle="card"></arcgis-legend>
    </arcgis-map>
  );
}
