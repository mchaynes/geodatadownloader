import { Authenticator, useAuthenticator, View } from "@aws-amplify/ui-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const { route } = useAuthenticator((ctx) => [ctx.route])
  const location = useLocation()
  const navigate = useNavigate()
  let from = location.state?.from?.pathname || "/"
  useEffect(() => {
    if (route === "authenticated") {
      navigate(from, { replace: true })
    }
  }, [route, navigate, from])
  return (
    <View className="auth-wrapper">
      <Authenticator />
    </View>
  )
}
