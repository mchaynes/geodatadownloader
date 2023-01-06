import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@emotion/react";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import { createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { FileHandler } from "./FileHandler";
import { Workflow } from "./Workflow";
import logo from "./icons/icon-128.png";
import { CompatibilityCheck } from "./CompatibilityCheck";
import { WelcomeMessage } from "./WelcomeMessage";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const theme = createTheme();

export type AppProps = {
  fileHandler: FileHandler;
};

function App({ fileHandler }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="absolute"
        color="default"
        elevation={0}
        sx={{
          position: "relative",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Toolbar>
          <img src={logo} width="32px" height="32px" alt="Pine" />
          <Typography sx={{ ml: 3 }} variant="h6" color="inherit" noWrap={true}>
            geodatadownloader
          </Typography>
        </Toolbar>
      </AppBar>
      <WelcomeMessage />

      <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{ mt: 3 }}>
          <CompatibilityCheck />
        </Box>
        <Workflow fileHandler={fileHandler} />
        <Footer />
      </Container>
    </ThemeProvider>
  );
}

function Footer() {
  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="body2" color="text.secondary" align="center">
        <Link
          color="inherit"
          href="https://github.com/mchaynes/geodatadownloader"
        >
          Github
        </Link>{" "}
      </Typography>
      <a
        href="https://www.buymeacoffee.com/myleschayng"
        target="_blank"
        style={{ textAlign: "center", display: "block", marginTop: 20 }}
      >
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          style={{
            height: "20px",
            width: "72px",
          }}
        />
      </a>
    </Box>
  );
}

export default App;
