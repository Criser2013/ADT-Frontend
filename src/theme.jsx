import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import Raleway from "./fonts/Raleway/Raleway-regular.ttf";
import Roboto from "./fonts/Roboto/Roboto-regular.ttf";

const tema = createTheme({
    typography: {
        htmlFontSize: 16,
        fontFamily: '"Roboto", Arial',
        h1: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
        },
        h2: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
        },
        h3: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
        },
        h4: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
        },
        h5: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
        },
        h6: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
        },
        body1: {
            fontFamily: '"Roboto", Arial',
        },
        body2: {
            fontFamily: '"Roboto", Arial',
        },
        button: {
            fontFamily: '"Roboto", Arial',
        }
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
    colorSchemes: {
        dark: true
    }
});

export const instanciaTema = responsiveFontSizes(tema);