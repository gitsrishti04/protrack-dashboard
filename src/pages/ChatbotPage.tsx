import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import Chatbot from "@/components/Chatbot";
import { Navigate } from "react-router-dom";

export default function ChatbotPage() {
  const { user } = useAuth();

  if (!user || user.role !== "super_admin") return <Navigate to="/dashboard" replace />;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] animate-fade-up">
        <Chatbot />
      </div>
    </DashboardLayout>
  );
}
