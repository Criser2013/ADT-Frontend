import { createTheme } from "@mui/material";
import Raleway from "./fonts/Raleway/Raleway-regular.ttf";
import Roboto from "./fonts/Roboto/Roboto-Regular.ttf";

const fuenteTitulos = {
    fontFamily: '"Raleway", sans-serif',
    fontWeight: 500,
    fontStyle: "bold"
};

export const themeOptions = createTheme({
    typography: {
        fontFamily: '"Roboto", sans-serif',
        h1: fuenteTitulos,
        h2: fuenteTitulos,
        h3: fuenteTitulos,
        h4: fuenteTitulos,
        h5: fuenteTitulos,
        h6: fuenteTitulos,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                @font-face {
                    font-family: 'Raleway';
                    font-style: normal;
                    font-display: swap;
                    font-weight: 500;
                    src: url(${Raleway}) format('truetype');
                }
                @font-face {
                    font-family: 'Roboto';
                    font-style: normal;
                    font-display: swap;
                    font-weight: 400;
                    src: url(${Roboto}) format('truetype');
                }
            `,
        },
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#005594',
        },
        secondary: {
            main: '#f50057',
        },
        divider: 'rgba(0,0,0,0.12)',
    },
});