import { useRef, useCallback, useEffect, useId } from "react";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-legend";
import type MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import Color from "@arcgis/core/Color";
import * as predominanceRendererCreator from "@arcgis/core/smartMapping/renderers/predominance";
import * as pieChartRendererCreator from "@arcgis/core/smartMapping/renderers/pieChart";
import Field from "@arcgis/core/layers/support/Field";
import type { ComputedIssue, Boundary } from "../../types/election";

interface ResultsMapProps {
  issue: ComputedIssue;
  boundaries: Boundary[];
  spatialReference: { wkid: number; latestWkid?: number };
  selectedBoundaryId: string | null;
  onSelectBoundary: (id: string | null) => void;
}

/** Map-specific palette — complementary to the app brand but without semantic meaning. */
const MAP_COLORS = [
  new Color("#00b389"), // vibrant teal
  new Color("#b835d6"), // electric purple
  new Color("#0091ff"), // bright blue
  new Color("#f59e0b"), // vivid amber
  new Color("#10b950"), // hot green
];

/** Sanitize a label for use as an ArcGIS field name (alphanumeric + underscore, max 64 chars). */
function toFieldName(label: string): string {
  return label.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 64);
}

export default function ResultsMap({
  issue,
  boundaries,
  spatialReference,
  selectedBoundaryId,
  onSelectBoundary,
}: ResultsMapProps) {
  const mapRef = useRef<HTMLElement | null>(null);
  const mapId = useId();
  const viewRef = useRef<MapView | null>(null);
  const predominanceLayerRef = useRef<FeatureLayer | null>(null);
  const pieLayerRef = useRef<FeatureLayer | null>(null);
  // ObjectID → boundary globalId lookup for resolving hitTest results
  const oidToGlobalIdRef = useRef<Map<number, string>>(new Map());
  // Stable ref for the callback so the click handler always sees the latest
  const onSelectBoundaryRef = useRef(onSelectBoundary);
  onSelectBoundaryRef.current = onSelectBoundary;
  const selectedBoundaryIdRef = useRef(selectedBoundaryId);
  selectedBoundaryIdRef.current = selectedBoundaryId;

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
      new Field({ name: "boundary_id", alias: "Boundary ID", type: "string" }),
      new Field({ name: "boundary_name", alias: "Boundary", type: "string" }),
      ...outcomeFieldDefs.map(
        (f) =>
          new Field({ name: f.fieldName, alias: f.label, type: "integer" }),
      ),
    ];

    // Build graphics with proper Polygon geometry instances
    const graphics: Graphic[] = [];
    const oidToGlobalId = new Map<number, string>();
    let idx = 0;

    for (const row of issue.voteRows) {
      const boundary = boundaryMap.get(row.boundaryId);
      if (!boundary?.geometry) continue;

      const oid = idx++;
      oidToGlobalId.set(oid, row.boundaryId);

      const attributes: Record<string, string | number> = {
        ObjectID: oid,
        boundary_id: row.boundaryId,
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

    oidToGlobalIdRef.current = oidToGlobalId;

    // Create a second copy of graphics for the pie chart layer
    const pieGraphics = graphics.map(
      (g) =>
        new Graphic({
          geometry: g.geometry!.clone(),
          attributes: { ...g.attributes },
        }),
    );

    // Predominance layer (polygon fill colored by winning outcome) — no popup
    const predominanceLayer = new FeatureLayer({
      source: graphics,
      objectIdField: "ObjectID",
      fields,
      geometryType: "polygon",
      spatialReference: sr,
      legendEnabled: false,
    });

    // Pie chart layer (drawn on top)
    const pieLayer = new FeatureLayer({
      source: pieGraphics,
      objectIdField: "ObjectID",
      fields,
      geometryType: "polygon",
      spatialReference: sr,
      legendEnabled: false,
    });

    // Access the map component's map and view
    const el = mapElement as unknown as {
      map: { add: (layer: FeatureLayer, index?: number) => void };
      view: MapView;
    };

    // Disable popups
    el.view.popupEnabled = false;

    // Store refs for the selection effect
    viewRef.current = el.view;
    predominanceLayerRef.current = predominanceLayer;
    pieLayerRef.current = pieLayer;

    // Add predominance first (index 0), then pie on top
    el.map.add(predominanceLayer, 0);
    el.map.add(pieLayer);

    // Handle map clicks for selection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    el.view.on("click", async (event: any) => {
      const hitResult = await el.view.hitTest(event);
      const results = hitResult.results.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) =>
          r.type === "graphic" &&
          (r.layer === predominanceLayer || r.layer === pieLayer),
      );
      if (results.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const oid = (results[0] as any).graphic.getAttribute("ObjectID") as number;
        const boundaryId = oidToGlobalIdRef.current.get(oid) ?? null;
        onSelectBoundaryRef.current(boundaryId);
      } else if (selectedBoundaryIdRef.current !== null) {
        onSelectBoundaryRef.current(null);
      }
    });

    const rendererAttributes = outcomeFieldDefs.map((f) => ({
      field: f.fieldName,
      label: f.label,
    }));

    const predominanceFields = outcomeFieldDefs.map((f) => ({
      name: f.fieldName,
      label: f.label,
    }));

    // Apply both renderers once layers are ready
    predominanceLayer.when(async () => {
      const response = await predominanceRendererCreator.createRenderer({
        layer: predominanceLayer,
        view: el.view as unknown as MapView,
        fields: predominanceFields,
        includeOpacityVariable: true,
        legendOptions: {
          title: issue.registry.issueName,
        },
      });

      // Override auto-generated colors with brand palette
      const predRenderer = response.renderer;
      predRenderer.uniqueValueInfos!.forEach((info, i) => {
        const sym = info.symbol as SimpleFillSymbol;
        sym.outline!.color = new Color("#ecedeb");
        sym.outline!.width = 0.7;
        sym.color = MAP_COLORS[i % MAP_COLORS.length]!;
      });
      predominanceLayer.renderer = predRenderer;
      predominanceLayer.legendEnabled = true;

      const result = await predominanceLayer.queryExtent();
      if (result.extent) {
        el.view.goTo(result.extent.expand(1.2));
      }
    });

    pieLayer.when(async () => {
      const response = await pieChartRendererCreator.createRenderer({
        layer: pieLayer,
        view: el.view as unknown as MapView,
        attributes: rendererAttributes,
        includeSizeVariable: true,
      });

      // Override auto-generated colors with brand palette
      const pieRenderer = response.renderer;
      pieRenderer.attributes.forEach((attr, i) => {
        attr.color = MAP_COLORS[i % MAP_COLORS.length]!;
      });

      pieRenderer.outline!.color = "#ecedeb";
      pieRenderer.outline!.width = 1;
      pieRenderer.visualVariables!.forEach((visVar) => {
        if (visVar.type === "size") visVar.maxSize = 25;
      });
      pieRenderer.holePercentage = 0.38;

      pieLayer.renderer = pieRenderer;
    });
  }, [issue, boundaries, spatialReference]);

  // Filter layers and zoom when selection changes
  useEffect(() => {
    const view = viewRef.current;
    const predLayer = predominanceLayerRef.current;
    const pieLayer = pieLayerRef.current;
    if (!view || !predLayer || !pieLayer) return;

    if (selectedBoundaryId) {
      const escaped = selectedBoundaryId.replace(/'/g, "''");
      const expr = `boundary_id = '${escaped}'`;
      predLayer.definitionExpression = expr;
      pieLayer.definitionExpression = expr;
    } else {
      predLayer.definitionExpression = "1=1";
      pieLayer.definitionExpression = "1=1";
    }

    // Wait for filter to apply, then zoom to the new extent
    Promise.all([predLayer.queryExtent(), pieLayer.queryExtent()]).then(
      ([predResult]) => {
        if (predResult.extent) {
          view.goTo(predResult.extent.expand(1.2));
        }
      },
    );
  }, [selectedBoundaryId, boundaries]);

  return (
    <>
      <arcgis-map
        ref={(el: HTMLElement | null) => {
          mapRef.current = el;
        }}
        basemap="gray-vector"
        onarcgisViewReadyChange={handleViewReady}
        id={mapId}
      >
        <arcgis-legend
          referenceElement={mapId}
          slot="bottom-right"
          legendStyle="card"
        ></arcgis-legend>
      </arcgis-map>
    </>
  );
}
