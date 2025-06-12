import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, Search, Package, AlertCircle, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define inventory item interface
interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unit: string | null;
  reorder_level: number | null;
  cost_price: number | null;
  selling_price: number | null;
  expiry_date: string | null;
  supplier: string | null;
  location: string | null;
  created_at: string;
  updated_at: string | null;
  user_id: string;
}

const Inventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state for adding/editing inventory item
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    unit: '',
    reorder_level: 0,
    cost_price: 0,
    selling_price: 0,
    expiry_date: '',
    supplier: '',
    location: '',
  });

  // Fetch inventory items on component mount
  useEffect(() => {
    if (user) {
      fetchInventoryItems();
    }
  }, [user]);

  // Fetch inventory items from Supabase
  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setInventoryItems(data || []);
      
      // Filter low stock items
      const lowStock = data?.filter(item => 
        item.quantity <= (item.reorder_level || 0)
      ) || [];
      
      setLowStockItems(lowStock);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Add new inventory item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) return;
      
      const { data, error } = await supabase.from('inventory').insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        quantity: formData.quantity,
        unit: formData.unit || null,
        reorder_level: formData.reorder_level || null,
        cost_price: formData.cost_price || null,
        selling_price: formData.selling_price || null,
        expiry_date: formData.expiry_date || null,
        supplier: formData.supplier || null,
        location: formData.location || null,
        created_at: new Date().toISOString(),
        updated_at: null,
      }).select();
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Inventory item added successfully',
      });
      
      // Reset form and close dialog
      resetForm();
      setIsAddDialogOpen(false);
      
      // Refresh inventory list
      fetchInventoryItems();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add inventory item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Edit inventory item
  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!currentItem) return;
      
      const { error } = await supabase
        .from('inventory')
        .update({
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          quantity: formData.quantity,
          unit: formData.unit || null,
          reorder_level: formData.reorder_level || null,
          cost_price: formData.cost_price || null,
          selling_price: formData.selling_price || null,
          expiry_date: formData.expiry_date || null,
          supplier: formData.supplier || null,
          location: formData.location || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentItem.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Inventory item updated successfully',
      });
      
      // Reset form and close dialog
      resetForm();
      setIsEditDialogOpen(false);
      
      // Refresh inventory list
      fetchInventoryItems();
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inventory item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Delete inventory item
  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Inventory item deleted successfully',
      });
      
      // Refresh inventory list
      fetchInventoryItems();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete inventory item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Open edit dialog and populate form
  const openEditDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      quantity: item.quantity,
      unit: item.unit || '',
      reorder_level: item.reorder_level || 0,
      cost_price: item.cost_price || 0,
      selling_price: item.selling_price || 0,
      expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : '',
      supplier: item.supplier || '',
      location: item.location || '',
    });
    setIsEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      quantity: 0,
      unit: '',
      reorder_level: 0,
      cost_price: 0,
      selling_price: 0,
      expiry_date: '',
      supplier: '',
      location: '',
    });
  };

  // Filter inventory items based on search query
  const filteredItems = inventoryItems.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchTerm) ||
      (item.description && item.description.toLowerCase().includes(searchTerm)) ||
      (item.category && item.category.toLowerCase().includes(searchTerm)) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm)) ||
      (item.location && item.location.toLowerCase().includes(searchTerm))
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <Layout>
      <div className="container mx-auto py-4 px-4 sm:px-6 sm:py-6 space-y-6">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">
              Manage your clinic's inventory items, track stock levels, and monitor supplies.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search inventory..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Package className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>
                    Add a new item to your inventory. Fill out the details below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddItem}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Item Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.quantity}
                          onChange={handleNumberChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          name="unit"
                          placeholder="e.g., boxes, bottles, packs"
                          value={formData.unit}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cost_price">Cost Price</Label>
                        <Input
                          id="cost_price"
                          name="cost_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.cost_price}
                          onChange={handleNumberChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="selling_price">Selling Price</Label>
                        <Input
                          id="selling_price"
                          name="selling_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.selling_price}
                          onChange={handleNumberChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reorder_level">Reorder Level</Label>
                        <Input
                          id="reorder_level"
                          name="reorder_level"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.reorder_level}
                          onChange={handleNumberChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiry_date">Expiry Date</Label>
                        <Input
                          id="expiry_date"
                          name="expiry_date"
                          type="date"
                          value={formData.expiry_date}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input
                          id="supplier"
                          name="supplier"
                          value={formData.supplier}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Storage Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Item</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">All Items</TabsTrigger>
            <TabsTrigger value="low-stock" className="flex-1 sm:flex-none flex items-center gap-1">
              Low Stock
              {lowStockItems.length > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {lowStockItems.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p>Loading inventory items...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-64">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No inventory items found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : 'Add your first inventory item to get started'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Mobile view - cards */}
                    <div className="sm:hidden">
                      <div className="space-y-4 p-3">
                        {currentItems.map((item) => (
                          <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow transition-all border-muted/60">
                            <CardContent className="p-0">
                              <div className="p-4 bg-muted/20">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-base">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">{item.category || 'No category'}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditDialog(item)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 space-y-3 bg-white">
                                <div className="flex justify-between items-center py-1 border-b">
                                  <span className="text-sm font-medium">Quantity</span>
                                  <span className={`${item.quantity <= (item.reorder_level || 0) ? 'text-red-600 font-medium' : ''}`}>
                                    {item.quantity} {item.unit || ''}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b">
                                  <span className="text-sm font-medium">Reorder Level</span>
                                  <span>{item.reorder_level || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm font-medium">Location</span>
                                  <span>{item.location || '-'}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {/* Desktop view - table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table className="border-collapse w-full">
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-left text-xs">Name</TableHead>
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-left text-xs">Category</TableHead>
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-left text-xs">Quantity</TableHead>
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-left text-xs">Reorder Level</TableHead>
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-left text-xs">Location</TableHead>
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-center text-xs w-10">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.map((item) => (
                            <TableRow 
                              key={item.id} 
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <TableCell className="font-medium border px-1 py-1 text-xs">{item.name}</TableCell>
                              <TableCell className="border px-1 py-1 text-xs">{item.category || '-'}</TableCell>
                              <TableCell className={`border px-1 py-1 text-xs ${item.quantity <= (item.reorder_level || 0) ? 'text-red-600 font-medium' : ''}`}>
                                {item.quantity} {item.unit || ''}
                              </TableCell>
                              <TableCell className="border px-1 py-1 text-xs">{item.reorder_level || '-'}</TableCell>
                              <TableCell className="border px-1 py-1 text-xs">{item.location || '-'}</TableCell>
                              <TableCell className="border px-1 py-1 text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                      <Pencil className="h-3.5 w-3.5 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t gap-4 bg-muted/10">
                      <div className="text-sm text-muted-foreground order-2 sm:order-1 font-medium">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
                      </div>
                      <div className="flex items-center space-x-2 order-1 sm:order-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0 border-muted-foreground/30"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous</span>
                        </Button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => paginate(pageNum)}
                                className={`w-8 h-8 p-0 ${currentPage !== pageNum ? 'border-muted-foreground/30' : ''}`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0 border-muted-foreground/30"
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next</span>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="low-stock" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Low Stock Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p>Loading low stock items...</p>
                  </div>
                ) : lowStockItems.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-64">
                    <h3 className="text-lg font-medium">No low stock items</h3>
                    <p className="text-muted-foreground">All your inventory items are above their reorder levels</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile view - cards */}
                    <div className="sm:hidden">
                      <div className="space-y-4 p-3">
                        {lowStockItems.map((item) => (
                          <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow transition-all border-muted/60">
                            <CardContent className="p-0">
                              <div className="p-4 bg-red-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-base">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">{item.category || 'No category'}</p>
                                  </div>
                                  <div className="flex items-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditDialog(item)}
                                      className="text-xs"
                                    >
                                      Update Stock
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 space-y-3 bg-white">
                                <div className="flex justify-between items-center py-1 border-b">
                                  <span className="text-sm font-medium">Quantity</span>
                                  <span className="text-red-600 font-medium">
                                    {item.quantity} {item.unit || ''}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm font-medium">Reorder Level</span>
                                  <span>{item.reorder_level}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {/* Desktop view - table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table className="border-collapse w-full">
                        <TableHeader>
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-left text-xs">Name</TableHead>
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-left text-xs">Category</TableHead>
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-left text-xs">Quantity</TableHead>
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-left text-xs">Reorder Level</TableHead>
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-left text-xs">Location</TableHead>
                            <TableHead className="font-medium text-muted-foreground border px-1 py-1 text-center text-xs w-10">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lowStockItems.map((item) => (
                            <TableRow 
                              key={item.id}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <TableCell className="font-medium border px-1 py-1 text-xs">{item.name}</TableCell>
                              <TableCell className="border px-1 py-1 text-xs">{item.category || '-'}</TableCell>
                              <TableCell className="text-red-600 font-medium border px-1 py-1 text-xs">
                                {item.quantity} {item.unit || ''}
                              </TableCell>
                              <TableCell className="border px-1 py-1 text-xs">{item.reorder_level}</TableCell>
                              <TableCell className="border px-1 py-1 text-xs">{item.location || '-'}</TableCell>
                              <TableCell className="border px-1 py-1 text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                      <Pencil className="h-3.5 w-3.5 mr-2" />
                                      Update Stock
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>
                Update the details of this inventory item.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditItem}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Item Name *</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-quantity">Quantity *</Label>
                    <Input
                      id="edit-quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.quantity}
                      onChange={handleNumberChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-unit">Unit</Label>
                    <Input
                      id="edit-unit"
                      name="unit"
                      placeholder="e.g., boxes, bottles, packs"
                      value={formData.unit}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-cost_price">Cost Price</Label>
                    <Input
                      id="edit-cost_price"
                      name="cost_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={handleNumberChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-selling_price">Selling Price</Label>
                    <Input
                      id="edit-selling_price"
                      name="selling_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.selling_price}
                      onChange={handleNumberChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-reorder_level">Reorder Level</Label>
                    <Input
                      id="edit-reorder_level"
                      name="reorder_level"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.reorder_level}
                      onChange={handleNumberChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-expiry_date">Expiry Date</Label>
                    <Input
                      id="edit-expiry_date"
                      name="expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-supplier">Supplier</Label>
                    <Input
                      id="edit-supplier"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Storage Location</Label>
                    <Input
                      id="edit-location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Inventory;