import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import logo from "/IMG_1039.png";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { supabase } from '../supabase';
import { AuthError } from '@supabase/supabase-js';
import { useState } from 'react';
import { StatusAlert } from '../StatusAlert';
import { useNavigate } from 'react-router-dom';


export default function Forgot() {
  const [error, setError] = useState<AuthError>()
  const navigate = useNavigate()
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email') as string
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      setError(error)
    } else {
      navigate("/")
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
          Forgot Password?
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                sx={{ minWidth: "368px" }}
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Send Reset Email
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
            </Grid>
            <Grid item>
              <Link href="/signin" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
        <StatusAlert alertType={error ? "error" : undefined} msg={error?.message} />
      </Box>
    </Container>
  );
}
