import AuthForm from "./AuthForm";
import useAuthForm from "./useAuthForm";
import "./Signup.css";

export default function SignUp() {
  const form = useAuthForm(true);
  return <AuthForm isSignup {...form} />;
}
