import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import { useEffect, useState, useMemo } from "react";

const Plot = createPlotlyComponent(Plotly);

interface UFData {
  sigla: string;
  percentual: number;
}

interface Props {
  data: UFData[];
}

const centroids: Record<string, { lat: number; lon: number }> = {
  AC: { lat: -9.02,  lon: -70.81 },
  AL: { lat: -9.57,  lon: -36.78 },
  AP: { lat:  1.41,  lon: -51.77 },
  AM: { lat: -4.07,  lon: -63.14 },
  BA: { lat: -12.96, lon: -41.34 },
  CE: { lat: -5.20,  lon: -39.53 },
  DF: { lat: -15.83, lon: -47.86 },
  ES: { lat: -19.19, lon: -40.34 },
  GO: { lat: -15.98, lon: -49.86 },
  MA: { lat: -5.42,  lon: -45.44 },
  MT: { lat: -12.64, lon: -55.42 },
  MS: { lat: -20.51, lon: -54.54 },
  MG: { lat: -18.10, lon: -44.38 },
  PA: { lat: -3.79,  lon: -52.48 },
  PB: { lat: -7.06,  lon: -36.06 },
  PR: { lat: -24.89, lon: -51.55 },
  PE: { lat: -8.28,  lon: -37.07 },
  PI: { lat: -7.71,  lon: -42.60 },
  RJ: { lat: -22.25, lon: -42.66 },
  RN: { lat: -5.81,  lon: -36.59 },
  RO: { lat: -10.83, lon: -63.34 },
  RR: { lat:  1.99,  lon: -61.33 },
  RS: { lat: -30.17, lon: -53.50 },
  SC: { lat: -27.33, lon: -49.44 },
  SP: { lat: -22.19, lon: -48.79 },
  SE: { lat: -10.57, lon: -37.45 },
  TO: { lat: -10.25, lon: -48.25 },
};

// GeoJSON cached at module level — fetched once per session
let geoJsonCache: any = null;
let geoJsonPromise: Promise<any> | null = null;

function loadGeoJson(): Promise<any> {
  if (geoJsonCache) return Promise.resolve(geoJsonCache);
  if (!geoJsonPromise) {
    geoJsonPromise = fetch("/geo/brasil-estados.geojson")
      .then((res) => res.json())
      .then((data) => {
        geoJsonCache = data;
        return data;
      });
  }
  return geoJsonPromise;
}

// Static objects — defined once, never recreated on render
const COLORSCALE = [
  [0.0,    "#BDBDBD"],
  [0.2499, "#BDBDBD"],
  [0.25,   "#FF8F00"],
  [0.4999, "#FF8F00"],
  [0.5,    "#FFEB3B"],
  [0.7499, "#FFEB3B"],
  [0.75,   "#168821"],
  [1.0,    "#168821"],
];

const MARKER = { line: { color: "#FFFFFF", width: 1 } };

const PLOT_LAYOUT = {
  autosize: true,
  geo: {
    projection: { type: "mercator" as const },
    showframe: false,
    showcoastlines: false,
    lonaxis: { range: [-74, -24] }, // -24 dá margem pros labels do nordeste
    lataxis: { range: [-34, 6] },
    bgcolor: "rgba(0,0,0,0)",
  },
  margin: { t: 0, b: 0, l: 0, r: 0 },
  paper_bgcolor: "rgba(0,0,0,0)",
  uirevision: "static",
};

const PLOT_CONFIG = { displayModeBar: false, responsive: true };

// Brasil em mercator com esses bounds tem aspect ratio ~0.88 (h/w)
// Em mobile portrait, limitar altura ao aspect ratio do mapa evita espaço em branco
const ASPECT_RATIO = 0.88;

function usePlotStyle() {
  const compute = () => {
    const mobile = window.innerWidth < 768;
    return {
      width: "100%",
      height: mobile
        ? `${Math.round(window.innerWidth * ASPECT_RATIO)}px`
        : "calc(100vh - 112px)",
    };
  };

  const [style, setStyle] = useState(compute);

  useEffect(() => {
    const update = () => setStyle(compute());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return style;
}

export default function BrazilMap({ data }: Props) {
  const plotStyle = usePlotStyle();

  // Start with cache so returning to /mapa renders instantly
  const [geoJson, setGeoJson] = useState<any>(geoJsonCache);

  useEffect(() => {
    if (geoJson) return;
    loadGeoJson()
      .then(setGeoJson)
      .catch((err) => console.error("Erro GeoJSON:", err));
  }, []);

  // Single pass over data — replaces 5 separate useMemo + loops
  const { locations, z, percentuais, yellowPoints, otherPoints } = useMemo(() => {
    const locations: string[]  = [];
    const z: number[]          = [];
    const percentuais: number[] = [];
    const yellowPoints: { lat: number; lon: number; text: string }[] = [];
    const otherPoints:  { lat: number; lon: number; text: string }[] = [];

    for (const d of data) {
      locations.push(d.sigla);
      percentuais.push(d.percentual);
      z.push(d.percentual === 0 ? 0 : d.percentual <= 30 ? 1 : d.percentual <= 49 ? 2 : 3);

      const c = centroids[d.sigla];
      if (c) {
        const point = { lat: c.lat, lon: c.lon, text: `${d.sigla}<br>${d.percentual}%` };
        (d.percentual > 30 && d.percentual <= 49 ? yellowPoints : otherPoints).push(point);
      }
    }

    return { locations, z, percentuais, yellowPoints, otherPoints };
  }, [data]);

  // Memoized so Plotly only diffs when data actually changes
  const plotData = useMemo(() => {
    if (!geoJson) return [];
    return [
      {
        type: "choropleth",
        geojson: geoJson,
        featureidkey: "properties.sigla",
        locations,
        z,
        customdata: percentuais,
        hovertemplate: "<b>%{location}</b><br>%{customdata}%<extra></extra>",
        zmin: 0,
        zmax: 3,
        colorscale: COLORSCALE,
        marker: MARKER,
        showscale: false,
      },
      {
        type: "scattergeo",
        mode: "text",
        lat: yellowPoints.map((p) => p.lat),
        lon: yellowPoints.map((p) => p.lon),
        text: yellowPoints.map((p) => p.text),
        textfont: { size: 10, color: "#000" },
        hoverinfo: "skip",
        showlegend: false,
      },
      {
        type: "scattergeo",
        mode: "text",
        lat: otherPoints.map((p) => p.lat),
        lon: otherPoints.map((p) => p.lon),
        text: otherPoints.map((p) => p.text),
        textfont: { size: 10, color: "#FFF" },
        hoverinfo: "skip",
        showlegend: false,
      },
    ] as any[];
  }, [geoJson, locations, z, percentuais, yellowPoints, otherPoints]);

  if (!geoJson) {
    return <div>Carregando mapa...</div>;
  }

  return (
    <Plot
      data={plotData}
      layout={PLOT_LAYOUT}
      config={PLOT_CONFIG}
      style={plotStyle}
    />
  );
}
