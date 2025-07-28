"use client";

import { useState } from "react";
import { UsersTable } from "@/components/users-table";
import { ProductsTable } from "@/components/products-table";
import { OrdersTable } from "@/components/orders-table";
import { DashboardCharts } from "@/components/dashboard-charts";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/login-form";

const menuItems = [
  { title: "Dashboard", icon: BarChart3, value: "dashboard" },
  { title: "Users", icon: Users, value: "users" },
  { title: "Products", icon: Package, value: "products" },
  { title: "Orders", icon: ShoppingCart, value: "orders" },
];

function DashboardContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Admin Panel</span>
              <span className="text-xs text-muted-foreground">
                FakeStore API
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.value}>
                <SidebarMenuButton
                  onClick={() => setActiveTab(item.value)}
                  isActive={activeTab === item.value}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="mt-auto p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <ModeToggle />
        </header>
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {menuItems.find((item) => item.value === activeTab)?.title ||
                "Dashboard"}
            </h2>
          </div>

          {activeTab === "dashboard" && <DashboardCharts />}
          {activeTab === "users" && <UsersTable />}
          {activeTab === "products" && <ProductsTable />}
          {activeTab === "orders" && <OrdersTable />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        {user ? <DashboardContent /> : <LoginForm />}
      </div>
    </ThemeProvider>
  );
}
