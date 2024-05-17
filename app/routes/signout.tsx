import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";


export const signoutAction = async () => {
  return await supabase.auth.signOut()
}

export default function SignOut() {
  return (
    <Navigate to="/" />
  )
}

