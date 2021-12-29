import { ThemeProvider } from '@emotion/react';
import AppBar from '@mui/material/AppBar'
import Container from '@mui/material/Container'
import createTheme from '@mui/material/styles/createTheme'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import './App.css';
import { Arcgis } from './arcgis';
import { FileHandler } from './FileHandler';
import { Workflow } from './Workflow';
import logo from './icons/icon-128.png'


const theme = createTheme();

export type AppProps = {
  arc: Arcgis
  fileHandler: FileHandler
}

function App({ arc, fileHandler }: AppProps) {
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
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
        <Workflow
          arc={arc}
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
