import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, FilePlus, Search, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import PrintInvoice from '@/components/PrintInvoice';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  id: string;
  patient_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string;
  created_at: string;
  patient: {
    first_name: string;
    last_name: string;
  };
  items: InvoiceItem[];
  currency_code: string;
  currency_symbol: string;
  region_id?: string;
}

interface Region {
  id: string;
  name: string;
  country: string;
  currency_code: string;
  currency_symbol: string;
}

const Invoices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<string>('pending');
  const [notes, setNotes] = useState<string>('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0, amount: 0 },
  ]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [taxType, setTaxType] = useState<'percentage' | 'fixed'>('percentage');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [total, setTotal] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRegionId, setUserRegionId] = useState<string>('');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch patients using React Query
  const { data: patients = [] } = useQuery({
    queryKey: ['patients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .order('first_name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch invoices using React Query
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(first_name, last_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Fetch invoice items for each invoice
      const invoicesWithItems = await Promise.all(
        (data || []).map(async (invoice) => {
          const { data: items, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id);
          if (itemsError) throw itemsError;
          return {
            ...invoice,
            items: items || [],
          };
        })
      );
      return invoicesWithItems;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch regions using React Query
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user region using React Query
  useQuery({
    queryKey: ['userRegion', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_regions')
        .select('region_id')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data?.region_id) {
        setUserRegionId(data.region_id);
        // Fetch region details
        const { data: regionData, error: regionError } = await supabase
          .from('regions')
          .select('*')
          .eq('id', data.region_id)
          .single();
        if (regionError) throw regionError;
        setSelectedRegion(regionData);
      }
      return null;
    },
    enabled: !!user,
  });

  // Remove useEffect for navigation, just redirect if no user
  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleAddInvoiceItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { description: '', quantity: 1, unit_price: 0, amount: 0 },
    ]);
  };

  const handleRemoveInvoiceItem = (index: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
  };

  const handleInvoiceItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updatedItems = [...invoiceItems];
    
    if (field === 'quantity' || field === 'unit_price') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      updatedItems[index] = { 
        ...updatedItems[index], 
        [field]: numValue,
        amount: field === 'quantity' 
          ? numValue * updatedItems[index].unit_price
          : updatedItems[index].quantity * numValue
      };
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    
    setInvoiceItems(updatedItems);
  };

  const calculateTotals = () => {
    const calculatedSubtotal = invoiceItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    setSubtotal(calculatedSubtotal);
    
    // Calculate tax amount based on tax type
    let taxAmount = 0;
    if (taxType === 'percentage') {
      taxAmount = calculatedSubtotal * (tax / 100);
    } else {
      taxAmount = tax;
    }
    
    // Calculate discount amount based on discount type
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = calculatedSubtotal * (discount / 100);
    } else {
      discountAmount = discount;
    }
    
    const calculatedTotal = calculatedSubtotal + taxAmount - discountAmount;
    setTotal(calculatedTotal);
  };

  const handleCreateInvoice = async () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }

    if (invoiceItems.length === 0 || !invoiceItems[0].description) {
      toast.error('Please add at least one item');
      return;
    }

    if (!selectedRegion) {
      toast.error('Please set up your region in Settings first');
      return;
    }

    try {
      // Calculate tax and discount amounts
      let taxAmount = 0;
      if (taxType === 'percentage') {
        taxAmount = subtotal * (tax / 100);
      } else {
        taxAmount = tax;
      }
      
      let discountAmount = 0;
      if (discountType === 'percentage') {
        discountAmount = subtotal * (discount / 100);
      } else {
        discountAmount = discount;
      }
      
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      // Generate invoice number (INV-YYYYMMDD-XXXX)
      const today = new Date();
      const dateStr = today.getFullYear().toString() +
                     (today.getMonth() + 1).toString().padStart(2, '0') +
                     today.getDate().toString().padStart(2, '0');
      const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
      const invoiceNumber = `INV-${dateStr}-${randomPart}`;
      
      // First, create the invoice
      const invoiceData = {
        user_id: user?.id,
        patient_id: selectedPatientId,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        status,
        subtotal,
        tax_rate: taxType === 'percentage' ? tax : 0,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        notes,
        currency_code: selectedRegion.currency_code,
        currency_symbol: selectedRegion.currency_symbol,
        region_id: selectedRegion.id
      };

      const { data: invoiceResult, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Then, create the invoice items
      const invoiceItemsData = invoiceItems.map((item) => ({
        invoice_id: invoiceResult.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.amount,
        amount: item.amount,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsData);

      if (itemsError) throw itemsError;

      toast.success('Invoice created successfully');
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;

    if (invoiceItems.length === 0 || !invoiceItems[0].description) {
      toast.error('Please add at least one item');
      return;
    }

    if (!selectedRegion) {
      toast.error('Please select a region');
      return;
    }

    try {
      // Calculate tax and discount amounts
      let taxAmount = 0;
      if (taxType === 'percentage') {
        taxAmount = subtotal * (tax / 100);
      } else {
        taxAmount = tax;
      }
      
      let discountAmount = 0;
      if (discountType === 'percentage') {
        discountAmount = subtotal * (discount / 100);
      } else {
        discountAmount = discount;
      }
      
      const totalAmount = subtotal + taxAmount - discountAmount;
      
      // Update the invoice
      const invoiceData = {
        patient_id: selectedPatientId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        status,
        subtotal,
        tax_rate: taxType === 'percentage' ? tax : 0,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        notes,
        currency_code: selectedRegion.currency_code,
        currency_symbol: selectedRegion.currency_symbol,
        region_id: selectedRegion.id
      };

      const { error: invoiceError } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', selectedInvoice.id);

      if (invoiceError) throw invoiceError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', selectedInvoice.id);

      if (deleteError) throw deleteError;

      // Create new items
      const invoiceItemsData = invoiceItems.map((item) => ({
        invoice_id: selectedInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.amount,
        amount: item.amount,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsData);

      if (itemsError) throw itemsError;

      toast.success('Invoice updated successfully');
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  const handleDeleteInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      // Delete invoice items first
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', selectedInvoice.id);

      if (itemsError) throw itemsError;

      // Then delete the invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', selectedInvoice.id);

      if (error) throw error;

      toast.success('Invoice deleted successfully');
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setSelectedPatientId(invoice.patient_id);
    setInvoiceDate(invoice.invoice_date);
    setDueDate(invoice.due_date);
    setStatus(invoice.status);
    setNotes(invoice.notes);
    setInvoiceItems(invoice.items);
    setSubtotal(invoice.subtotal);
    setTax(invoice.tax_rate);
    setDiscount(invoice.discount_amount);
    setTotal(invoice.total_amount);
    
    // Set the selected region based on the invoice's region_id
    if (invoice.region_id) {
      try {
        const { data: regionData, error } = await supabase
          .from('regions')
          .select('*')
          .eq('id', invoice.region_id)
          .single();
        
        if (error) throw error;
        
        if (regionData) {
          setSelectedRegion(regionData);
        }
      } catch (error) {
        console.error('Error fetching region data:', error);
      }
    }
    
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const openPrintDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPrintDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedInvoice(null);
    setSelectedPatientId('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setStatus('pending');
    setNotes('');
    setInvoiceItems([{ description: '', quantity: 1, unit_price: 0, amount: 0 }]);
    setSubtotal(0);
    setTax(0);
    setTaxType('percentage');
    setDiscount(0);
    setDiscountType('fixed');
    setTotal(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number, currencySymbol: string = '$', currencyCode: string = 'USD') => {
    // Format based on currency code
    switch (currencyCode) {
      case 'INR':
        // For Indian Rupee, use INR prefix instead of symbol
        return `INR ${amount.toFixed(2)}`;
      
      default:
        // For other currencies, use the provided symbol
        return `${currencySymbol} ${amount.toFixed(2)}`;
    }
  };

  const getFilteredInvoices = () => {
    if (!searchQuery) return invoices;

    const query = searchQuery.toLowerCase();
    return invoices.filter(
      (invoice) =>
        invoice.patient.first_name.toLowerCase().includes(query) ||
        invoice.patient.last_name.toLowerCase().includes(query) ||
        invoice.status.toLowerCase().includes(query) ||
        invoice.invoice_date.includes(query)
    );
  };

  const filteredInvoices = getFilteredInvoices();
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <Layout>
      <div className="container mx-auto py-4 px-4 sm:px-6 sm:py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Invoices</h1>
          <Button 
            className="flex items-center gap-2 w-full sm:w-auto" 
            onClick={openCreateDialog}
          >
            <FilePlus size={16} />
            <span>New Invoice</span>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Invoice Records</CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full sm:w-[240px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-4">Loading invoices...</div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No invoices match your search.' : 'No invoices found'}
                </p>
                <div className="flex justify-center">
                  <Button onClick={openCreateDialog} className="flex items-center gap-2">
                    <FilePlus size={16} />
                    <span>Create Your First Invoice</span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop view - Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table className="border-collapse w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="h-9 px-2 text-xs font-medium">Date</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium">Patient</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium">Status</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium">Due Date</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium">Total</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium w-[80px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-muted/50 border-b border-border/50">
                          <TableCell className="p-2 text-sm">{formatDate(invoice.invoice_date)}</TableCell>
                          <TableCell className="p-2 text-sm font-medium">
                            {invoice.patient.first_name} {invoice.patient.last_name}
                          </TableCell>
                          <TableCell className="p-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="p-2 text-sm">{formatDate(invoice.due_date)}</TableCell>
                          <TableCell className="p-2 text-sm">
                            {formatCurrency(invoice.total_amount, invoice.currency_symbol, invoice.currency_code)}
                          </TableCell>
                          <TableCell className="p-2 text-sm">
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openPrintDialog(invoice)}
                                className="h-8 w-8"
                                title="Print invoice"
                              >
                                <FilePlus size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(invoice)}
                                className="h-8 w-8"
                                title="Edit invoice"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(invoice)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete invoice"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Mobile view - Cards */}
                <div className="sm:hidden">
                  <div className="space-y-3 py-2 px-3">
                    {currentItems.map((invoice) => (
                      <div key={invoice.id} className="border rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">
                              {invoice.patient.first_name} {invoice.patient.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(invoice.invoice_date)}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm mb-3">
                          <div className="text-muted-foreground">Due Date:</div>
                          <div>{formatDate(invoice.due_date)}</div>
                          
                          <div className="text-muted-foreground">Total:</div>
                          <div className="font-medium">
                            {formatCurrency(invoice.total_amount, invoice.currency_symbol, invoice.currency_code)}
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-1 mt-3 border-t pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPrintDialog(invoice)}
                            className="h-8"
                            title="Print invoice"
                          >
                            <FilePlus size={14} className="mr-1" />
                            <span>Print</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(invoice)}
                            className="h-8"
                            title="Edit invoice"
                          >
                            <Pencil size={14} className="mr-1" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(invoice)}
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete invoice"
                          >
                            <Trash2 size={14} className="mr-1" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t gap-4">
                  <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} invoices
                  </div>
                  <div className="flex items-center space-x-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={currentPage === 1}
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
                            className="w-8 h-8 p-0"
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

        {/* Create/Edit Invoice Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedInvoice ? 'Edit Invoice' : 'New Invoice'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient">Patient</Label>
                  <Select
                    value={selectedPatientId}
                    onValueChange={setSelectedPatientId}
                  >
                    <SelectTrigger id="patient">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes for the invoice"
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <h3 className="font-medium">Invoice Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddInvoiceItem}
                    className="flex items-center gap-1 w-full sm:w-auto"
                  >
                    <PlusCircle size={14} />
                    <span>Add Item</span>
                  </Button>
                </div>

                {invoiceItems.map((item, index) => (
                  <div key={index} className="border rounded-md p-3 sm:p-4 mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                      <h4 className="font-medium">Item #{index + 1}</h4>
                      {invoiceItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInvoiceItem(index)}
                          className="flex items-center gap-1 text-destructive hover:bg-destructive/10 w-full sm:w-auto justify-center sm:justify-start"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-3">
                      <div>
                        <Label htmlFor={`item-${index}-description`}>Description</Label>
                        <Input
                          id={`item-${index}-description`}
                          value={item.description}
                          onChange={(e) => handleInvoiceItemChange(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor={`item-${index}-quantity`}>Quantity</Label>
                          <Input
                            id={`item-${index}-quantity`}
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleInvoiceItemChange(index, 'quantity', parseFloat(e.target.value))}
                            min="1"
                            step="1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`item-${index}-price`}>Unit Price</Label>
                          <Input
                            id={`item-${index}-price`}
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => handleInvoiceItemChange(index, 'unit_price', parseFloat(e.target.value))}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`item-${index}-amount`}>Amount</Label>
                          <Input
                            id={`item-${index}-amount`}
                            type="number"
                            value={item.amount}
                            readOnly
                            className="bg-muted/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-muted/50 p-4 rounded-md">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal:</span>
                    <span>{selectedRegion ? formatCurrency(subtotal, selectedRegion.currency_symbol, selectedRegion.currency_code) : formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="font-medium">Tax:</span>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                      <Select value={taxType} onValueChange={(value) => setTaxType(value as 'percentage' | 'fixed')}>
                        <SelectTrigger className="w-full sm:w-[110px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                          type="number"
                          value={tax}
                          onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full sm:w-24 text-right"
                        />
                        {taxType === 'percentage' && <span>%</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="font-medium">Discount:</span>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                      <Select value={discountType} onValueChange={(value) => setDiscountType(value as 'percentage' | 'fixed')}>
                        <SelectTrigger className="w-full sm:w-[110px]">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-full sm:w-24 text-right"
                        />
                        {discountType === 'percentage' && <span>%</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-lg">
                      {selectedRegion ? formatCurrency(total, selectedRegion.currency_symbol, selectedRegion.currency_code) : formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={selectedInvoice ? handleUpdateInvoice : handleCreateInvoice}
                className="w-full sm:w-auto"
              >
                {selectedInvoice ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Invoice</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete this invoice? This action cannot be undone.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteInvoice}
                className="w-full sm:w-auto"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Print Invoice Dialog */}
        {selectedInvoice && (
          <PrintInvoice
            invoice={selectedInvoice}
            isOpen={isPrintDialogOpen}
            onClose={() => setIsPrintDialogOpen(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Invoices;