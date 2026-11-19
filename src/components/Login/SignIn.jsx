import AuthForm from "./AuthForm";
import useAuthForm from "./useAuthForm";
import "./Signin.css";

export default function SignIn() {
  const form = useAuthForm(false);
  return <AuthForm isSignup={false} {...form} />;
}
