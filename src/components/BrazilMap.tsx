// // src/components/BrazilMap.tsx

import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";

const Plot = createPlotlyComponent(Plotly);

// interface UFData {
//   uf: string;
//   percentual: number;
// }

// interface Props {
//   data: UFData[];
// }

// export default function BrazilMap({ data }: Props) {
//   return (
//     <Plot
//       data={[
//         {
//           type: "choropleth",
//           locations: data.map((d) => d.uf),
//           z: data.map((d) => d.percentual),
//           text: data.map((d) => `${d.uf}<br>${d.percentual}%`),

//           colorscale: [
//             [0, "#f5f5f5"],
//             [0.25, "#d9d9d9"],
//             [0.5, "#bdbdbd"],
//             [0.75, "#737373"],
//             [1, "#252525"],
//           ],

//           zmin: 0,
//           zmax: 100,

//           marker: {
//             line: {
//               color: "#ffffff",
//               width: 1,
//             },
//           },

//           hovertemplate:
//             "<b>%{location}</b><br>" +
//             "Percentual: %{z}%<extra></extra>",
//         },
//       ]}
//       layout={{
//         geo: {
//           scope: "south america",
//           projection: {
//             type: "mercator",
//           },
//           center: {
//             lat: -14,
//             lon: -55,
//           },
//           lonaxis: {
//             range: [-75, -30],
//           },
//           lataxis: {
//             range: [-35, 6],
//           },
//           showframe: false,
//           showcoastlines: false,
//           bgcolor: "rgba(0,0,0,0)",
//         },

//         paper_bgcolor: "rgba(0,0,0,0)",

//         margin: {
//           t: 0,
//           b: 0,
//           l: 0,
//           r: 0,
//         },
//       }}
//       style={{
//         width: "100%",
//         height: "600px",
//       }}
//       config={{
//         responsive: true,
//         displayModeBar: false,
//       }}
//     />
//   );
// }

// export default function BrazilMap() {
//   return (
//     <div
//       style={{
//         background: "red",
//         color: "white",
//         padding: "20px",
//         minHeight: "100px"
//       }}
//     >
//       MAPA CARREGADO
//     </div>
//   );
// }

//import Plot from "react-plotly.js";


// export default function BrazilMap() {
//   return (
//     <Plot
//       data={[
//         {
//           x: ["A", "B", "C"],
//           y: [10, 20, 30],
//           type: "bar",
//         },
//       ]}
//       layout={{
//         title: "Teste Plotly",
//         height: 400,
//       }}
//       style={{
//         width: "100%",
//       }}
//     />
//   );
// }

import { useEffect, useState, useMemo } from "react";
// import Plot from "react-plotly.js";

interface UFData {
  sigla: string;
  percentual: number;
}

interface Props {
  data: UFData[];
}

// =========================
// 🧭 CENTROIDES
// =========================
const centroids: Record<string, { lat: number; lon: number }> = {
  AC: { lat: -9.02, lon: -70.81 },
  AL: { lat: -9.57, lon: -36.78 },
  AP: { lat: 1.41, lon: -51.77 },
  AM: { lat: -4.07, lon: -63.14 },
  BA: { lat: -12.96, lon: -41.34 },
  CE: { lat: -5.20, lon: -39.53 },
  DF: { lat: -15.83, lon: -47.86 },
  ES: { lat: -19.19, lon: -40.34 },
  GO: { lat: -15.98, lon: -49.86 },
  MA: { lat: -5.42, lon: -45.44 },
  MT: { lat: -12.64, lon: -55.42 },
  MS: { lat: -20.51, lon: -54.54 },
  MG: { lat: -18.10, lon: -44.38 },
  PA: { lat: -3.79, lon: -52.48 },
  PB: { lat: -7.06, lon: -36.06 },
  PR: { lat: -24.89, lon: -51.55 },
  PE: { lat: -8.28, lon: -37.07 },
  PI: { lat: -7.71, lon: -42.60 },
  RJ: { lat: -22.25, lon: -42.66 },
  RN: { lat: -5.81, lon: -36.59 },
  RO: { lat: -10.83, lon: -63.34 },
  RR: { lat: 1.99, lon: -61.33 },
  RS: { lat: -30.17, lon: -53.50 },
  SC: { lat: -27.33, lon: -49.44 },
  SP: { lat: -22.19, lon: -48.79 },
  SE: { lat: -10.57, lon: -37.45 },
  TO: { lat: -10.25, lon: -48.25 },
};

export default function BrazilMap({ data }: Props) {
  const [geoJson, setGeoJson] = useState<any>(null);

  // =========================
  // ⚡ HOOKS PRIMEIRO
  // =========================
  const locations = useMemo(() => data.map((d) => d.sigla), [data]);

  const z = useMemo(
    () =>
      data.map((d) => {
        if (d.percentual === 0) return 0;
        if (d.percentual <= 30) return 1;
        if (d.percentual <= 49) return 2;
        return 3;
      }),
    [data]
  );

  const percentuais = useMemo(
    () => data.map((d) => d.percentual),
    [data]
  );

  const yellowStates = useMemo(
    () => data.filter((d) => d.percentual > 30 && d.percentual <= 49),
    [data]
  );

  const otherStates = useMemo(
    () => data.filter((d) => d.percentual <= 30 || d.percentual > 49),
    [data]
  );

  const buildPoints = (list: UFData[]) =>
    list
      .map((d) => {
        const c = centroids[d.sigla];
        if (!c) return null;

        return {
          lat: c.lat,
          lon: c.lon,
          text: `${d.sigla}<br>${d.percentual}%`,
        };
      })
      .filter(Boolean) as { lat: number; lon: number; text: string }[];

  const yellowPoints = useMemo(
    () => buildPoints(yellowStates),
    [yellowStates]
  );

  const otherPoints = useMemo(
    () => buildPoints(otherStates),
    [otherStates]
  );

  // =========================
  // 🌐 GEOJSON
  // =========================
  useEffect(() => {
    fetch("/geo/brasil-estados.geojson")
      .then((res) => res.json())
      .then(setGeoJson)
      .catch((err) => console.error("Erro GeoJSON:", err));
  }, []);

  if (!geoJson) {
    return <div>Carregando mapa...</div>;
  }

  return (
    <Plot
      data={[
        // =========================
        // 🗺️ MAPA
        // =========================
        {
          type: "choropleth",
          geojson: geoJson,
          featureidkey: "properties.sigla",

          locations,
          z,
          customdata: percentuais,

          hovertemplate:
            "<b>%{location}</b><br>%{customdata}%<extra></extra>",

          zmin: 0,
          zmax: 3,

          colorscale: [
            [0.0, "#BDBDBD"],
            [0.2499, "#BDBDBD"],

            [0.25, "#FF8F00"],
            [0.4999, "#FF8F00"],

            [0.5, "#FFEB3B"], // 🟡 AMARELO GARANTIDO
            [0.7499, "#FFEB3B"],

            [0.75, "#168821"],
            [1.0, "#168821"],
          ],

          marker: {
            line: {
              color: "#FFFFFF",
              width: 1,
            },
          },

          showscale: false,
        } as any,

        // =========================
        // 🟡 LABELS AMARELOS
        // =========================
        {
          type: "scattergeo",
          mode: "text",
          lat: yellowPoints.map((p) => p.lat),
          lon: yellowPoints.map((p) => p.lon),
          text: yellowPoints.map((p) => p.text),

          textfont: {
            size: 10,
            color: "#000",
          },

          hoverinfo: "skip",
          showlegend: false,
        } as any,

        // =========================
        // ⚪ OUTROS
        // =========================
        {
          type: "scattergeo",
          mode: "text",
          lat: otherPoints.map((p) => p.lat),
          lon: otherPoints.map((p) => p.lon),
          text: otherPoints.map((p) => p.text),

          textfont: {
            size: 10,
            color: "#FFF",
          },

          hoverinfo: "skip",
          showlegend: false,
        } as any,
      ]}
      layout={{
        geo: {
  projection: {
    type: "mercator",
    //scale: 1.0, // 👈 importante: não força zoom
  },

  fitbounds: "locations", // 👈 deixa o Plotly controlar o zoom corretamente

  showframe: false,
  showcoastlines: false,
},

        margin: {
          t: 0,
          b: 0,
          l: 0,
          r: 0,
        },
      }}
      config={{
        displayModeBar: false,
        responsive: true,
      }}
      style={{
  width: "100%",
  height: "850px",
}}
    />
  );
}