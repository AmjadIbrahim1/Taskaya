// src/components/layouts/MainLayout.tsx - FIXED: Pass auth context properly
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Side } from "../Side";
import { AddTask } from "../AddTask";
import { Search } from "../Search";

interface MainLayoutProps {
  authMethod: "clerk" | "jwt" | null;
}

export function MainLayout({ authMethod }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("🏠 MainLayout - Auth Method:", authMethod);

  // Determine active view based on current route
  const getActiveView = (): "all" | "completed" | "urgent" => {
    if (location.pathname === "/completed") return "completed";
    if (location.pathname === "/urgent") return "urgent";
    return "all";
  };

  const [activeView, setActiveView] = useState<"all" | "completed" | "urgent">(
    getActiveView()
  );

  // Update active view when location changes
  useEffect(() => {
    setActiveView(getActiveView());
  }, [location.pathname]);

  // Handle view change with navigation
  const handleViewChange = (view: "all" | "completed" | "urgent") => {
    console.log("📍 View changing to:", view);
    setActiveView(view);

    switch (view) {
      case "all":
        navigate("/");
        break;
      case "completed":
        navigate("/completed");
        break;
      case "urgent":
        navigate("/urgent");
        break;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Side activeView={activeView} onViewChange={handleViewChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
        {/* Search Section */}
        <Search authMethod={authMethod} />

        {/* Add Task Section */}
        <AddTask authMethod={authMethod} />

        {/* Content Area - Outlet for nested routes with context */}
        <Outlet context={{ authMethod }} />
      </div>
    </div>
  );
}
