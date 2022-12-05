import React from "react";
import { ThemeProvider } from "@emotion/react";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import { createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
// import './App.css';
import { FileHandler } from "./FileHandler";
import { Workflow } from "./Workflow";
import logo from "./icons/icon-128.png";
import CompatibilityCheck from "./CompatibilityCheck";

const theme = createTheme();

const openInNewTab = (url: string) => () => {
  window.open(url, "_blank");
};

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
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{ mt: 3 }}>
          <CompatibilityCheck />
        </Box>
        <Workflow fileHandler={fileHandler} />
        <Footer />
        <Container align="center" sx={{ mt: 5 }}>
          <form
            action="https://www.paypal.com/donate"
            method="post"
            target="_top"
          >
            <input type="hidden" name="business" value="AH5ZRXXH4H78A" />
            <input type="hidden" name="no_recurring" value="0" />
            <input
              type="hidden"
              name="item_name"
              value="If you want to support geodatadownloader.com"
            />
            <input type="hidden" name="currency_code" value="USD" />
            <input
              type="image"
              src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif"
              border="0"
              name="submit"
              title="PayPal - The safer, easier way to pay online!"
              alt="Donate with PayPal button"
            />
            <img
              alt=""
              border="0"
              src="https://www.paypal.com/en_US/i/scr/pixel.gif"
              width="1"
              height="1"
            />
          </form>
        </Container>
      </Container>
    </ThemeProvider>
  );
}

function Footer() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      <Link
        color="inherit"
        href="https://github.com/mchaynes/geodatadownloader"
      >
        Github
      </Link>{" "}
    </Typography>
  );
}

export default App;
