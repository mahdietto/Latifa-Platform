import { Navigate } from "react-router-dom";
import GuestLanding from "@/components/GuestLanding";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GuestLanding />;
  }

  if (user) {
    return <Navigate to="/library" replace />;
  }

  return <GuestLanding />;
};

export default Landing;
