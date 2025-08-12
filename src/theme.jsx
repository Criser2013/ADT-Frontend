import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import Raleway from "./fonts/Raleway/Raleway-regular.ttf";
import Roboto from "./fonts/Roboto/Roboto-Regular.ttf";

const tema = createTheme({
    typography: {
        htmlFontSize: 16,
        fontFamily: '"Roboto", Arial',
        h1: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
            //fontSize: "calc(2.5rem + 2vw)"
        },
        h2: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
            //fontSize: "calc(2.25rem + 1vw)"
        },
        h3: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
            //fontSize: "calc(2rem + 1vw)"
        },
        h4: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
            //fontSize: "calc(0.9rem + 1vw)"
        },
        h5: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
            //fontSize: "calc(0.6rem + 1vw)"
        },
        h6: {
            fontFamily: '"Raleway", Arial',
            fontWeight: 500,
            fontStyle: "bold",
            //fontSize: "calc(0.5rem + 1vw)"
        },
        body1: {
            fontFamily: '"Roboto", Arial',
        //    fontSize: "calc(0.2rem + 1vw)"
        },
        body2: {
            fontFamily: '"Roboto", Arial',
          //  fontSize: "calc(0.3rem + 1vw)"
        },
        button: {
            fontFamily: '"Roboto", Arial',
            //fontSize: "calc(0.3rem + 1vw)"
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