import { Button, Container, Paper, TextField } from "@mui/material";
import { useState } from "react";
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      alert(error)
    }
  }

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    if (error) {
      alert(error)
    }
  }

  return (
    <Container >
      <Paper sx={{ padding: "2rem" }}>
        <Container sx={{ flexDirection: "column" }}>
          <TextField
            fullWidth={true}
            label={"Email"}
            type="email"
            value={email}
            onChange={e => setEmail(e.currentTarget.value)}
          />
          <TextField
            fullWidth={true}
            label={"Password"}
            type={"password"}
            value={password}
            onChange={e => setPassword(e.currentTarget.value)}
          />
        </Container>

        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", padding: "1rem" }}>
          <div style={{ flexGrow: 1 }} />
          <Button variant={"outlined"} onClick={handleSignUp}>Sign Up</Button>
          <Button variant={"contained"} onClick={handleLogin}>Login</Button>
        </div>
      </Paper>
    </Container>

  )
}
