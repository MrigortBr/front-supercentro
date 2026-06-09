import { Paper } from "@mui/material";

import GanttChart from "../components/GanttChart";

import { Institution } from "../types";

interface GanttPageProps {
    institutions: Institution[];
    topOffset: number;
}

export default function GanttPage({ institutions, topOffset }: GanttPageProps) {
    return (
        <Paper sx={{ overflow: "hidden", width: "100%" }}>
            <GanttChart institutions={institutions} topOffset={topOffset} />
        </Paper>
    );
}
