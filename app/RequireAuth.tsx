import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, Route, useNavigate } from 'react-router-dom';
import { supabase } from './supabase'

let user: User | null = null
let session: Session | null = null

const authContext = createContext({
  user: user,
  session: session,
  signIn: async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (result.error) {
      throw new Error(JSON.stringify(result.error))
    }
    user = result.data.user
    session = result.data.session
  },
  signOut: async () => {
    const result = await supabase.auth.signOut()
    if (result.error) {
      throw new Error(JSON.stringify(result.error))
    }
  }
})


export function useAuth() {
  return useContext(authContext)
}

export function ProvideAuth({ children }) {
  const auth = useAuth()
  console.log(auth)
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  )
}

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
