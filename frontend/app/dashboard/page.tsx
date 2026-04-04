"use client";

import React, { useEffect, useState } from "react";
import GuestView from "../components/dashboard/GuestView";
import StaffView from "../components/dashboard/StaffView";
import ManagerView from "../components/dashboard/ManagerView";
import AdminView from "../components/dashboard/AdminView";

const DashboardPage = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  if (!user) return null;

  switch (user.role?.toLowerCase()) {
    case "admin":
      return <AdminView />;
    case "manager":
      return <ManagerView />;
    case "staff":
      return <StaffView />;
    default:
      return <GuestView />;
  }
};

export default DashboardPage;
