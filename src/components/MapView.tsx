import { Box, Typography } from "@mui/material";
import { MapPin } from "lucide-react";

export default function MapView() {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 1,
				py: 10,
				color: "text.secondary",
			}}
		>
			<MapPin size={40} />
			<Typography variant="h6">Mapa</Typography>
		</Box>
	);
}
