import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase'

export function RequireAuth({ children }) {
  const navigate = useNavigate()
  useEffect(() => {
    const checkSignIn = async () => {
      const session = await supabase.auth.getSession()
      if (!session?.data?.session) {
        navigate("/login")
      }
    }
    checkSignIn
  }, [])
  return (
    <>{children}</>
  )
}
