import type Polygon from '@arcgis/core/geometry/Polygon';
import type { Boundary } from '../types/election';
import { fetchAllFeatures, hasField, getFieldAlias } from './arcgis-client';

export interface BoundariesResult {
  boundaries: Boundary[];
  hasInternalId: boolean;
  internalIdAlias: string | null;
  spatialReference: { wkid: number; latestWkid?: number } | null;
}

export async function fetchBoundaries(url: string): Promise<BoundariesResult> {
  const { features, fields, spatialReference } = await fetchAllFeatures({
    url,
    outFields: ['*'],
    returnGeometry: true,
  });

  const hasInternalId = hasField(fields, 'internal_id');
  const internalIdAlias = hasInternalId ? getFieldAlias(fields, 'internal_id') : null;

  const boundaries: Boundary[] = features.map((f) => ({
    globalId: f.attributes.GlobalID as string,
    internalId: hasInternalId ? (f.attributes.internal_id as string | null) : null,
    internalIdAlias,
    registeredVoters: f.attributes.registered_voters as number | null,
    totalPopulation: f.attributes.total_population as number | null,
    geometry: f.geometry as unknown as Polygon | null,
  }));

  return { boundaries, hasInternalId, internalIdAlias, spatialReference };
}
