"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";

interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  address: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
    geolocation: {
      lat: string;
      long: string;
    };
  };
  phone: string;
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof User | "name">("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://fakestoreapi.com/users");
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.name.firstname} ${user.name.lastname}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      // --- Initialize aValue and bValue with a type that matches their usage ---
      let aValue: string | number;
      let bValue: string | number;
      // --- End Initialization ---

      // --- Determine the actual values to sort by based on sortField ---
      if (sortField === "name") {
        // Handle the special "name" case
        aValue = `${a.name.firstname} ${a.name.lastname}`;
        bValue = `${b.name.firstname} ${b.name.lastname}`;
      } else if (sortField === "id") {
        // Handle numeric fields
        aValue = a[sortField]; // This is a number
        bValue = b[sortField]; // This is a number
      } else {
        // Handle string fields that are direct properties of User (username, email, phone)
        // We know these are strings based on the User interface
        // Type assertion is safe here because we checked the sortField
        aValue = a[sortField] as string;
        bValue = b[sortField] as string;
      }
      // Note: This logic intentionally excludes sorting by complex object fields like 'address' or 'name' object
      // If you needed to sort by address.city, you'd add another else if branch for 'address.city' (as a string key)
      // and access a.address.city directly.

      // --- Perform comparison based on the determined type ---
      // Check the type of the *values* we just assigned
      if (typeof aValue === "string" && typeof bValue === "string") {
        // Both are strings, safe to use toLowerCase
        const aLower = aValue.toLowerCase();
        const bLower = bValue.toLowerCase();
        if (sortDirection === "asc") {
          return aLower < bLower ? -1 : aLower > bLower ? 1 : 0;
        } else {
          return aLower > bLower ? -1 : aLower < bLower ? 1 : 0;
        }
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        // Both are numbers, sort numerically
        if (sortDirection === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      } else {
        // This else block should ideally not be reached given the logic above,
        // but provides a fallback. It correctly handles the case where one or
        // both values might not be string/number by converting them.
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (sortDirection === "asc") {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      }
      // --- End Comparison ---
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof User | "name") => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredUsers.map((user) => ({
      ID: user.id,
      Username: user.username,
      Email: user.email,
      Name: `${user.name.firstname} ${user.name.lastname}`,
      Phone: user.phone,
      City: user.address.city,
      Street: `${user.address.number} ${user.address.street}`,
      Zipcode: user.address.zipcode,
    }));
    exportToCSV(csvData, "users");
  };

  const handleExportPDF = () => {
    const pdfData = filteredUsers.map((user) => [
      user.id.toString(),
      user.username,
      user.email,
      `${user.name.firstname} ${user.name.lastname}`,
      user.phone,
      user.address.city,
    ]);
    const headers = ["ID", "Username", "Email", "Name", "Phone", "City"];
    exportToPDF(pdfData, headers, "Users Report");
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Management</CardTitle>
        <CardDescription>Manage and view all registered users</CardDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("id")}
              >
                ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("username")}
              >
                Username{" "}
                {sortField === "username" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{`${user.name.firstname} ${user.name.lastname}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.address.city}</TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}{" "}
            users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
