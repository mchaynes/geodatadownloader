import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { supabase } from '../supabase';
import { useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import { StatusAlert } from '../StatusAlert';

import logo from "/IMG_1039.png";
import { useNavigate } from 'react-router-dom';



export default function SignIn() {
  const [error, setError] = useState<AuthError>()
  const navigate = useNavigate()
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email') as string
    const password = data.get('password') as string
    if (email && password) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      if (error) {
        setError(error)
      } else {
        navigate("/")
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Link href="/">
          <img
            src={logo as string}
            width="48px"
            height="48px"
            alt="Geodatadownloader Logo"
          />
        </Link>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="/forgot" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <StatusAlert alertType={error ? 'error' : undefined} msg={error?.message} />
    </Container>
  );
}
