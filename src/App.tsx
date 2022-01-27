import React from 'react'
import { ThemeProvider } from '@emotion/react';
import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import { createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
// import './App.css';
import { FileHandler } from './FileHandler';
import { Workflow } from './Workflow';
import logo from './icons/icon-128.png'
import IconButton from '@mui/material/IconButton';
import GithubSvg from './icons/GithubSvg';
import SvgIcon from '@mui/material/SvgIcon';
import CompatibilityCheck from './CompatibilityCheck';


const theme = createTheme();

const openInNewTab = (url: string) => () => {
  window.open(url, "_blank")
}

export type AppProps = {
  fileHandler: FileHandler
}

function App({ fileHandler }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position='absolute'
        color="default"
        elevation={0}
        sx={{
          position: 'relative',
          borderBottom: (t) => `1px solid ${t.palette.divider}`
        }}
      >
        <Toolbar>
          <img src={logo} width="32px" height="32px" alt="Pine" />
          <Typography sx={{ ml: 3 }} variant="h6" color="inherit" noWrap>
            geodatadownloader
          </Typography>
          <Box sx={{ flexGrow: 1 }} ></Box>
          <IconButton
            color="inherit"
            onClick={openInNewTab("https://github.com/mchaynes/geodatadownloader")}
          >
            <SvgIcon>
              <GithubSvg />
            </SvgIcon>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{ mt: 3 }}>
          <CompatibilityCheck />
        </Box>
        <Workflow
          fileHandler={fileHandler}
        />
        <Footer />
      </Container>
    </ThemeProvider>
  );
}

function Footer() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      <Link color="inherit" href="https://github.com/mchaynes/geodatadownloader">
        Github
      </Link>{' '}
    </Typography>
  );
}

export default App;
