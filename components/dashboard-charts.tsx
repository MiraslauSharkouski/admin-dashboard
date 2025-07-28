"use client";

import React, { useState, useEffect } from "react"; // Import React for types
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";

// --- Type Definitions ---
// Define the structure of your data points
interface CategoryDataPoint {
  name: string;
  value: number; // Assuming count is a number
}

interface MonthlyDataPoint {
  month: string;
  users: number;
  orders: number;
  revenue: number;
}

// Define the structure of your stats
interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  products: {
    label: "Products",
    color: "hsl(var(--chart-2))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-3))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-4))",
  },
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function DashboardCharts() {
  // --- Explicitly Typed State ---
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]); // Array of CategoryDataPoint objects
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]); // Array of MonthlyDataPoint objects

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch("https://fakestoreapi.com/users");
      const users = await usersRes.json();

      // Fetch products
      const productsRes = await fetch("https://fakestoreapi.com/products");
      const products: { category: string }[] = await productsRes.json(); // Type assertion for product structure used here

      // Generate mock orders and revenue data
      const mockOrders = 150;
      const mockRevenue = 25000;

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: mockOrders,
        totalRevenue: mockRevenue,
      });

      // Process category data for pie chart
      const categoryCount: Record<string, number> = {}; // Use Record<string, number> for dynamic keys
      products.forEach((product) => {
        categoryCount[product.category] =
          (categoryCount[product.category] || 0) + 1;
      });

      // Map to the expected structure for Recharts
      const categoryChartData: CategoryDataPoint[] = Object.entries(
        categoryCount
      ).map(([name, value]) => ({
        name,
        value,
      }));
      setCategoryData(categoryChartData);

      // Generate monthly data for line chart
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const monthlyChartData: MonthlyDataPoint[] = months.map((month) => ({
        month,
        users: Math.floor(Math.random() * 50) + 20,
        orders: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 5000) + 2000,
      }));
      setMonthlyData(monthlyChartData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +22% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>
              Users, orders, and revenue trends over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="var(--color-users)"
                    strokeWidth={2}
                    // dot={{ r: 2 }} // Optional: Add dots to line points
                    // activeDot={{ r: 6 }} // Optional: Style for active dot
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--color-orders)"
                    strokeWidth={2}
                  />
                  {/* Optional: Add Revenue line if needed in LineChart */}
                  {/* <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                  /> */}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>
              Distribution of products by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
