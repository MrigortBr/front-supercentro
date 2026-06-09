import { Paper } from "@mui/material";

import MapView from "../components/MapView";

export default function MapPage() {
    return (
        <Paper sx={{ overflow: "hidden", width: "100%" }}>
            <MapView />
        </Paper>
    );
}
