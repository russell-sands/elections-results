import { queryFeatures } from '@esri/arcgis-rest-feature-service';
import type { IQueryFeaturesResponse } from '@esri/arcgis-rest-feature-service';
import type { IFeature, IField } from '@esri/arcgis-rest-request';

export interface QueryResult {
  features: IFeature[];
  fields: IField[];
}

export async function fetchAllFeatures(options: {
  url: string;
  outFields?: string[];
  returnGeometry?: boolean;
}): Promise<QueryResult> {
  const response = (await queryFeatures({
    url: options.url,
    where: '1=1',
    outFields: options.outFields ?? ['*'],
    returnGeometry: options.returnGeometry ?? false,
  })) as IQueryFeaturesResponse;

  return {
    features: response.features,
    fields: response.fields ?? [],
  };
}

export function hasField(fields: IField[], fieldName: string): boolean {
  return fields.some((f) => f.name === fieldName);
}

export function getFieldAlias(fields: IField[], fieldName: string): string | null {
  const field = fields.find((f) => f.name === fieldName);
  return field?.alias ?? null;
}
