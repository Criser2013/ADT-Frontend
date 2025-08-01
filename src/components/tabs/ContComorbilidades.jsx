import { Box, Chip } from "@mui/material";

/**
 * Contenedor que muestra una lista de comorbilidades como chips. Es de solo lectura.
 * @param {Array[String]} comorbilidades - Lista de comorbilidades a mostrar.
 * @returns 
 */
export default function ContComorbilidades({ comorbilidades }) {
    return (
        <Box
            borderColor="blue"
            borderRadius={3}
            border={1}
            padding="2vh"
            style={{ borderColor: "#adadad" }}
            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {comorbilidades.map((x) => (
                <Chip
                    key={x}
                    label={x}
                    color="info"
                    variant="outlined"
                    size="medium" />
            ))}
        </Box>);
};