import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// @ts-ignore
import "@fontsource/baloo-2";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6c63ff",
    },
    secondary: {
      main: "#ff80ab",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontFamily: '"Baloo 2", cursive',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Baloo 2", cursive',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Baloo 2", cursive',
      fontWeight: 700,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </LocalizationProvider>
  </React.StrictMode>
);
