import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function SignOut() {
  useEffect(() => {
    supabase.auth.signOut()
  }, [])
  return (
    <Navigate to="/" />
  )
}
