import { useEffect, useRef } from 'react';
import MapView from '@arcgis/core/views/MapView';
import ArcGISMap from '@arcgis/core/Map';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import { envConfig } from '../../config/env';
import styles from './ElectionMap.module.css';

export default function ElectionMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!containerRef.current || !envConfig.boundariesLayerUrl) return;

    const boundariesLayer = new FeatureLayer({
      url: envConfig.boundariesLayerUrl,
      renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: [0, 0, 0, 0],
          outline: {
            color: [176, 172, 164, 1],
            width: 1.5,
          },
        }),
      }),
      popupTemplate: {
        title: '{internal_id}',
        content: 'Boundary ID: {GlobalID}',
      },
    });

    const map = new ArcGISMap({
      basemap: 'gray-vector',
      layers: [boundariesLayer],
    });

    const view = new MapView({
      container: containerRef.current,
      map,
      zoom: 10,
    });

    viewRef.current = view;

    // Zoom to boundaries extent once loaded
    boundariesLayer.when(() => {
      boundariesLayer.queryExtent().then((result) => {
        if (result.extent) {
          view.goTo(result.extent.expand(1.2));
        }
      });
    });

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={styles.map} />;
}
