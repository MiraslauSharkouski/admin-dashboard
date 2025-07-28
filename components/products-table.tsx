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
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import Image from "next/image";

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Product>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortField, sortDirection]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("https://fakestoreapi.com/products");
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    const filtered = products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // --- Handle sorting by different types ---
      let comparisonResult = 0;

      if (
        sortField === "title" ||
        sortField === "category" ||
        sortField === "description"
      ) {
        // We know these fields are strings
        const aStr = (aValue as string).toLowerCase();
        const bStr = (bValue as string).toLowerCase();
        comparisonResult = aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else if (sortField === "id" || sortField === "price") {
        // We know these fields are numbers
        const aNum = aValue as number;
        const bNum = bValue as number;
        comparisonResult = aNum - bNum;
      } else if (sortField === "rating") {
        // We know this field is an object { rate: number, count: number }
        // Let's sort by rating.rate
        const aRate = (aValue as Product["rating"]).rate;
        const bRate = (bValue as Product["rating"]).rate;
        comparisonResult = aRate - bRate;
      }
      // Note: sortField 'image' is less common to sort by meaningfully,
      // but if needed, you could add a case for it.

      // Apply sort direction
      return sortDirection === "asc" ? comparisonResult : -comparisonResult;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Product) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredProducts.map((product) => ({
      ID: product.id,
      Title: product.title,
      Price: product.price,
      Category: product.category,
      Rating: product.rating.rate,
      "Rating Count": product.rating.count,
      Description: product.description.substring(0, 100) + "...",
    }));
    exportToCSV(csvData, "products");
  };

  const handleExportPDF = () => {
    const pdfData = filteredProducts.map((product) => [
      product.id.toString(),
      product.title.substring(0, 30) + "...",
      `$${product.price}`,
      product.category,
      product.rating.rate.toString(),
      product.rating.count.toString(),
    ]);
    const headers = ["ID", "Title", "Price", "Category", "Rating", "Reviews"];
    exportToPDF(pdfData, headers, "Products Report");
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "men's clothing": "bg-blue-100 text-blue-800",
      "women's clothing": "bg-pink-100 text-pink-800",
      jewelery: "bg-yellow-100 text-yellow-800",
      electronics: "bg-green-100 text-green-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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
        <CardTitle>Products Management</CardTitle>
        <CardDescription>
          Manage and view all products in the store
        </CardDescription>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
              <TableHead>Image</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("title")}
              >
                Title{" "}
                {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("price")}
              >
                Price{" "}
                {sortField === "price" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("category")}
              >
                Category{" "}
                {sortField === "category" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.id}</TableCell>
                <TableCell>
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={product.title}>
                    {product.title}
                  </div>
                </TableCell>
                <TableCell className="font-medium">${product.price}</TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(product.category)}>
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating.rate}</span>
                    <span className="text-muted-foreground">
                      ({product.rating.count})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.rating.count > 100 ? "default" : "secondary"
                    }
                  >
                    {product.rating.count > 100 ? "In Stock" : "Low Stock"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredProducts.length)} of{" "}
            {filteredProducts.length} products
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
