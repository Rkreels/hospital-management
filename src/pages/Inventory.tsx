"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from '../lib/store';
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  XCircle,
  RefreshCw,
  Edit,
  Plus,
  Minus,
  MapPin,
  Tag,
  Barcode,
  Boxes,
  ArrowUpDown,
  Eye,
  History,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "react-toastify";
import type { InventoryItem } from "../types";

// Status badge colors
const getStatusColor = (status: InventoryItem['status']): string => {
  switch (status) {
    case 'In Stock':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Low Stock':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Out of Stock':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Expired':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'On Order':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Quantity color coding
const getQuantityColor = (quantity: number, minStock: number): string => {
  if (quantity === 0) return 'text-red-600 font-semibold';
  if (quantity < minStock) return 'text-amber-600 font-semibold';
  return 'text-green-600 font-semibold';
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Categories for filter
const categories = [
  'Medical Supplies',
  'Equipment',
  'Pharmaceuticals',
  'Office Supplies',
  'Linens',
  'Food Service',
  'Maintenance',
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem; direction: 'asc' | 'desc' }>({ 
    key: 'name', 
    direction: 'asc' 
  });
  
  // Dialog states
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState<string>("");
  const [updateReason, setUpdateReason] = useState<string>("");

  // Fetch inventory data
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res;
        setInventory(data);
      } else {
        toast.error("Failed to fetch inventory");
      }
    } catch {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStockItems = inventory.filter(item => item.status === 'Low Stock').length;
    const outOfStockItems = inventory.filter(item => item.status === 'Out of Stock').length;
    const expiredItems = inventory.filter(item => item.status === 'Expired').length;
    
    return { totalItems, totalValue, lowStockItems, outOfStockItems, expiredItems };
  }, [inventory]);

  // Get low stock items for alerts
  const lowStockAlerts = useMemo(() => {
    return inventory.filter(item => 
      item.status === 'Low Stock' || item.status === 'Out of Stock'
    ).sort((a, b) => {
      // Out of stock first, then by quantity
      if (a.status === 'Out of Stock' && b.status !== 'Out of Stock') return -1;
      if (a.status !== 'Out of Stock' && b.status === 'Out of Stock') return 1;
      return a.quantity - b.quantity;
    });
  }, [inventory]);

  // Filter and sort inventory
  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => {
        const matchesSearch = 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue 
            : bValue - aValue;
        }
        
        return 0;
      });
  }, [inventory, searchQuery, categoryFilter, statusFilter, sortConfig]);

  // Handle sort
  const handleSort = (key: keyof InventoryItem) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Open update dialog
  const openUpdateDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setUpdateQuantity(item.quantity.toString());
    setUpdateReason("");
    setIsUpdateDialogOpen(true);
  };

  // Open details dialog
  const openDetailsDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailsDialogOpen(true);
  };

  // Handle stock update
  const handleUpdateStock = async () => {
    if (!selectedItem) return;
    
    const newQuantity = parseInt(updateQuantity);
    if (isNaN(newQuantity) || newQuantity < 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      const res = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedItem.id,
          quantity: newQuantity,
        }),
      });

      if (res.ok) {
        toast.success("Stock updated successfully");
        fetchInventory();
        setIsUpdateDialogOpen(false);
      } else {
        toast.error("Failed to update stock");
      }
    } catch {
      toast.error("Failed to update stock");
    }
  };

  // Adjust quantity
  const adjustQuantity = (adjustment: number) => {
    const current = parseInt(updateQuantity) || 0;
    const newQuantity = Math.max(0, current + adjustment);
    setUpdateQuantity(newQuantity.toString());
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Inventory Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage hospital inventory items, stock levels, and reorder alerts
            </p>
          </div>
          <Button variant="outline" onClick={fetchInventory} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Boxes className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{stats.totalItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-100">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-md transition-shadow border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-100">
                    <TrendingDown className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock Items</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.lowStockItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-md transition-shadow border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-100">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Reorder Alerts */}
        <AnimatePresence>
          {lowStockAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-lg text-amber-800">Reorder Alerts</CardTitle>
                    <Badge variant="secondary" className="bg-amber-200 text-amber-800">
                      {lowStockAlerts.length} items need attention
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      {lowStockAlerts.slice(0, 10).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-200"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`text-sm font-medium ${getQuantityColor(item.quantity, item.minStock)}`}>
                                {item.quantity} {item.unit}
                              </p>
                              <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
                            </div>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openUpdateDialog(item)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Update
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search by name, SKU, category, or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="On Order">On Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/30 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-foreground">
                        Item <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium">
                      <button onClick={() => handleSort('sku')} className="flex items-center gap-1 hover:text-foreground">
                        SKU <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium">
                      <button onClick={() => handleSort('category')} className="flex items-center gap-1 hover:text-foreground">
                        Category <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-center">
                      <button onClick={() => handleSort('quantity')} className="flex items-center gap-1 justify-center hover:text-foreground">
                        Quantity <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      <button onClick={() => handleSort('unitCost')} className="flex items-center gap-1 justify-end hover:text-foreground">
                        Unit Cost <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      <button onClick={() => handleSort('totalValue')} className="flex items-center gap-1 justify-end hover:text-foreground">
                        Total Value <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Supplier</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence mode="popLayout">
                    {filteredInventory.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`hover:bg-muted/30 transition-colors ${
                          item.status === 'Out of Stock' ? 'bg-red-50/50' :
                          item.status === 'Low Stock' ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Package className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-muted-foreground" />
                            <span className="font-mono text-sm text-muted-foreground">{item.sku}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-muted-foreground" />
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div>
                            <p className={getQuantityColor(item.quantity, item.minStock)}>
                              {item.quantity} {item.unit}
                            </p>
                            <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium">{formatCurrency(item.unitCost)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-medium">{formatCurrency(item.totalValue)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="text-sm">{item.location}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{item.supplier}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDetailsDialog(item)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openUpdateDialog(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            
            {filteredInventory.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No inventory items found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Stock Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Update Stock Quantity</DialogTitle>
              <DialogDescription>
                Adjust the stock quantity for {selectedItem?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <p className="text-lg font-medium">
                  {selectedItem?.quantity} {selectedItem?.unit}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">New Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustQuantity(-10)}
                  >
                    <span className="text-lg">-10</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustQuantity(-1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={updateQuantity}
                    onChange={(e) => setUpdateQuantity(e.target.value)}
                    className="text-center"
                    min="0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustQuantity(1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustQuantity(10)}
                  >
                    <span className="text-lg">+10</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Select value={updateReason} onValueChange={setUpdateReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restock">Restock</SelectItem>
                    <SelectItem value="usage">Usage</SelectItem>
                    <SelectItem value="damage">Damage</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="return">Return to Supplier</SelectItem>
                    <SelectItem value="adjustment">Inventory Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedItem && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reorder Level:</span>
                    <span>{selectedItem.reorderLevel} {selectedItem.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Stock:</span>
                    <span>{selectedItem.minStock} {selectedItem.unit}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStock}>
                Update Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Item Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Item Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedItem?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">SKU</p>
                    <p className="font-mono">{selectedItem.sku}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="outline">{selectedItem.category}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className={getQuantityColor(selectedItem.quantity, selectedItem.minStock)}>
                      {selectedItem.quantity} {selectedItem.unit}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedItem.status)}>
                      {selectedItem.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Unit Cost</p>
                    <p className="font-medium">{formatCurrency(selectedItem.unitCost)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="font-medium">{formatCurrency(selectedItem.totalValue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {selectedItem.location}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-muted-foreground" />
                      {selectedItem.supplier}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Min Stock</p>
                    <p>{selectedItem.minStock} {selectedItem.unit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Max Stock</p>
                    <p>{selectedItem.maxStock} {selectedItem.unit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Reorder Level</p>
                    <p>{selectedItem.reorderLevel} {selectedItem.unit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Reorder Quantity</p>
                    <p>{selectedItem.reorderQuantity} {selectedItem.unit}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Last Restocked</p>
                    <p className="flex items-center gap-1">
                      <History className="w-3 h-3 text-muted-foreground" />
                      {new Date(selectedItem.lastRestocked).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedItem.expiryDate && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p>{new Date(selectedItem.expiryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsDetailsDialogOpen(false);
                if (selectedItem) openUpdateDialog(selectedItem);
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Update Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
