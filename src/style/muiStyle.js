
import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#d8438c',
        },
        secondary: {
            main: '#f9be38',
        },
        success: {
            main: '#4CAF50',
        },
        background: {
            default: '#121212',
            paper: '#1f1f1f',
        },
        text: {
            primary: '#E0E0E0',
            secondary: '#BDBDBD',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
    },
});

export const formFieldStyle = {
    width: "40%",
    marginTop: 1,
    marginBottom: 1
}

export const formBoxStyle = {
    display: 'flex',
    flexGrow: 6,
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 1
}

export const linkStyle = { textDecoration: 'none' }

export const typographyBodyLink = { color: 'primary.main', textDecoration: 'underline' }

export const wrapTextStyle = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }

export const elevationCards = 1;

export const elevationBackground = 0;

export const elevationArea = 3;
