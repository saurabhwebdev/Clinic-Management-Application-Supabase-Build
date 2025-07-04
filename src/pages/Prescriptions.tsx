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
import PrintPrescription from '@/components/PrintPrescription';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface Visit {
  id: string;
  visit_date: string;
  reason_for_visit: string;
}

interface PrescriptionItem {
  id?: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  visit_id: string | null;
  prescription_date: string;
  diagnosis: string;
  notes: string;
  created_at: string;
  patient: {
    first_name: string;
    last_name: string;
  };
  items: PrescriptionItem[];
}

const Prescriptions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedVisitId, setSelectedVisitId] = useState<string>('none');
  const [prescriptionDate, setPrescriptionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
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
    cacheTime: 30 * 60 * 1000,
  });

  // Fetch prescriptions using React Query
  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['prescriptions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient:patients(first_name, last_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Fetch prescription items for each prescription
      const prescriptionsWithItems = await Promise.all(
        (data || []).map(async (prescription) => {
          const { data: items, error: itemsError } = await supabase
            .from('prescription_items')
            .select('*')
            .eq('prescription_id', prescription.id);
          if (itemsError) throw itemsError;
          return {
            ...prescription,
            items: items || [],
          };
        })
      );
      return prescriptionsWithItems;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  // Fetch visits for selected patient using React Query
  const { data: visits = [] } = useQuery({
    queryKey: ['visits', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      const { data, error } = await supabase
        .from('patient_visits')
        .select('id, visit_date, reason_for_visit')
        .eq('patient_id', selectedPatientId)
        .order('visit_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedPatientId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  // Remove useEffect for navigation, just redirect if no user
  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleAddPrescriptionItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ]);
  };

  const handleRemovePrescriptionItem = (index: number) => {
    const updatedItems = [...prescriptionItems];
    updatedItems.splice(index, 1);
    setPrescriptionItems(updatedItems);
  };

  const handlePrescriptionItemChange = (
    index: number,
    field: keyof PrescriptionItem,
    value: string
  ) => {
    const updatedItems = [...prescriptionItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setPrescriptionItems(updatedItems);
  };

  const handleCreatePrescription = async () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    if (prescriptionItems.length === 0 || !prescriptionItems[0].medication_name) {
      toast.error('Please add at least one medication');
      return;
    }
    try {
      const prescriptionData = {
        user_id: user.id,
        patient_id: selectedPatientId,
        visit_id: selectedVisitId === 'none' ? null : selectedVisitId,
        prescription_date: prescriptionDate,
        diagnosis,
        notes,
      };
      const { data: prescriptionResult, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert(prescriptionData)
        .select()
        .single();
      if (prescriptionError) throw prescriptionError;
      const prescriptionItemsData = prescriptionItems.map((item) => ({
        prescription_id: prescriptionResult.id,
        medication_name: item.medication_name,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
      }));
      const { error: itemsError } = await supabase
        .from('prescription_items')
        .insert(prescriptionItemsData);
      if (itemsError) throw itemsError;
      toast.success('Prescription created successfully');
      resetForm();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    }
  };

  const handleUpdatePrescription = async () => {
    if (!selectedPrescription) return;
    try {
      const prescriptionData = {
        patient_id: selectedPatientId,
        visit_id: selectedVisitId === 'none' ? null : selectedVisitId,
        prescription_date: prescriptionDate,
        diagnosis,
        notes,
        updated_at: new Date().toISOString(),
      };
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .update(prescriptionData)
        .eq('id', selectedPrescription.id);
      if (prescriptionError) throw prescriptionError;
      const { error: deleteError } = await supabase
        .from('prescription_items')
        .delete()
        .eq('prescription_id', selectedPrescription.id);
      if (deleteError) throw deleteError;
      const prescriptionItemsData = prescriptionItems.map((item) => ({
        prescription_id: selectedPrescription.id,
        medication_name: item.medication_name,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
      }));
      const { error: itemsError } = await supabase
        .from('prescription_items')
        .insert(prescriptionItemsData);
      if (itemsError) throw itemsError;
      toast.success('Prescription updated successfully');
      resetForm();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast.error('Failed to update prescription');
    }
  };

  const handleDeletePrescription = async () => {
    if (!selectedPrescription) return;
    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', selectedPrescription.id);
      if (error) throw error;
      toast.success('Prescription deleted successfully');
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('Failed to delete prescription');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setSelectedPatientId(prescription.patient_id);
    setSelectedVisitId(prescription.visit_id || 'none');
    setPrescriptionDate(prescription.prescription_date);
    setDiagnosis(prescription.diagnosis || '');
    setNotes(prescription.notes || '');
    setPrescriptionItems(prescription.items.length > 0 ? prescription.items : [{ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedPrescription(null);
    setSelectedPatientId('');
    setSelectedVisitId('none');
    setPrescriptionDate(new Date().toISOString().split('T')[0]);
    setDiagnosis('');
    setNotes('');
    setPrescriptionItems([
      { medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Add this new function to filter prescriptions based on search query
  const getFilteredPrescriptions = () => {
    if (!searchQuery.trim()) {
      return prescriptions;
    }
    const query = searchQuery.toLowerCase();
    return prescriptions.filter(prescription => {
      const patientName = `${prescription.patient.first_name} ${prescription.patient.last_name}`.toLowerCase();
      const medications = prescription.items.map(item => item.medication_name.toLowerCase()).join(' ');
      return (
        patientName.includes(query) ||
        (prescription.diagnosis && prescription.diagnosis.toLowerCase().includes(query)) ||
        medications.includes(query)
      );
    });
  };

  const filteredPrescriptions = getFilteredPrescriptions();
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrescriptions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <Layout>
      <div className="container mx-auto py-4 px-4 sm:px-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Prescriptions</h1>
          <Button 
            className="flex items-center gap-2 w-full sm:w-auto" 
            onClick={openCreateDialog}
          >
            <FilePlus size={16} />
            <span>New Prescription</span>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Prescription Records</CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-full sm:w-[240px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-4">Loading prescriptions...</div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No prescriptions match your search.' : 'No prescriptions found'}
                </p>
                <Button onClick={openCreateDialog} className="flex items-center gap-2">
                  <FilePlus size={16} />
                  <span>Create Your First Prescription</span>
                </Button>
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
                        <TableHead className="h-9 px-2 text-xs font-medium">Diagnosis</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium">Medications</TableHead>
                        <TableHead className="h-9 px-2 text-xs font-medium w-[80px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((prescription) => (
                        <TableRow key={prescription.id} className="hover:bg-muted/50 border-b border-border/50">
                          <TableCell className="p-2 text-sm">{formatDate(prescription.prescription_date)}</TableCell>
                          <TableCell className="p-2 text-sm font-medium">
                            {prescription.patient.first_name} {prescription.patient.last_name}
                          </TableCell>
                          <TableCell className="p-2 text-sm">{prescription.diagnosis || '-'}</TableCell>
                          <TableCell className="p-2 text-sm">
                            {prescription.items.length > 0
                              ? prescription.items.map((item) => item.medication_name).join(', ')
                              : '-'}
                          </TableCell>
                          <TableCell className="p-2 text-sm">
                            <div className="flex justify-center gap-1">
                              <PrintPrescription prescription={prescription} />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(prescription)}
                                className="h-8 w-8"
                                title="Edit prescription"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(prescription)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete prescription"
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
                    {currentItems.map((prescription) => (
                      <div key={prescription.id} className="border rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">
                              {prescription.patient.first_name} {prescription.patient.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(prescription.prescription_date)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <PrintPrescription prescription={prescription} />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(prescription)}
                              className="h-7 w-7"
                              title="Edit prescription"
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(prescription)}
                              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete prescription"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        
                        {prescription.diagnosis && (
                          <div className="mb-2">
                            <div className="text-sm font-medium">Diagnosis:</div>
                            <div className="text-sm">{prescription.diagnosis}</div>
                          </div>
                        )}
                        
                        <div className="mb-1">
                          <div className="text-sm font-medium">Medications:</div>
                          <div className="text-sm">
                            {prescription.items.length > 0
                              ? prescription.items.map((item, idx) => (
                                  <div key={idx} className="text-sm">
                                    {item.medication_name} {item.dosage && `(${item.dosage})`}
                                  </div>
                                ))
                              : '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t gap-4">
                  <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPrescriptions.length)} of {filteredPrescriptions.length} prescriptions
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
      </div>

      {/* Create/Edit Prescription Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPrescription ? 'Edit Prescription' : 'New Prescription'}
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
                <Label htmlFor="visit">Related Visit (Optional)</Label>
                <Select
                  value={selectedVisitId}
                  onValueChange={setSelectedVisitId}
                  disabled={!selectedPatientId}
                >
                  <SelectTrigger id="visit">
                    <SelectValue placeholder="Select visit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {visits.map((visit) => (
                      <SelectItem key={visit.id} value={visit.id}>
                        {formatDate(visit.visit_date)} - {visit.reason_for_visit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="prescriptionDate">Prescription Date</Label>
              <Input
                id="prescriptionDate"
                type="date"
                value={prescriptionDate}
                onChange={(e) => setPrescriptionDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Patient diagnosis"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
                rows={3}
              />
            </div>

            <div className="mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <h3 className="font-medium">Medications</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPrescriptionItem}
                  className="flex items-center gap-1 w-full sm:w-auto"
                >
                  <PlusCircle size={14} />
                  <span>Add Medication</span>
                </Button>
              </div>

              {prescriptionItems.map((item, index) => (
                <div key={index} className="border rounded-md p-3 sm:p-4 mb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                    <h4 className="font-medium">Medication #{index + 1}</h4>
                    {prescriptionItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemovePrescriptionItem(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <div>
                      <Label htmlFor={`medication-${index}`}>Medication Name</Label>
                      <Input
                        id={`medication-${index}`}
                        value={item.medication_name}
                        onChange={(e) =>
                          handlePrescriptionItemChange(index, 'medication_name', e.target.value)
                        }
                        placeholder="Medication name"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                      <Input
                        id={`dosage-${index}`}
                        value={item.dosage}
                        onChange={(e) =>
                          handlePrescriptionItemChange(index, 'dosage', e.target.value)
                        }
                        placeholder="e.g., 500mg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <div>
                      <Label htmlFor={`frequency-${index}`}>Frequency</Label>
                      <Input
                        id={`frequency-${index}`}
                        value={item.frequency}
                        onChange={(e) =>
                          handlePrescriptionItemChange(index, 'frequency', e.target.value)
                        }
                        placeholder="e.g., Twice daily"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`duration-${index}`}>Duration</Label>
                      <Input
                        id={`duration-${index}`}
                        value={item.duration}
                        onChange={(e) =>
                          handlePrescriptionItemChange(index, 'duration', e.target.value)
                        }
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`instructions-${index}`}>Instructions</Label>
                    <Input
                      id={`instructions-${index}`}
                      value={item.instructions}
                      onChange={(e) =>
                        handlePrescriptionItemChange(index, 'instructions', e.target.value)
                      }
                      placeholder="e.g., Take with food"
                    />
                  </div>
                </div>
              ))}
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
              onClick={selectedPrescription ? handleUpdatePrescription : handleCreatePrescription}
              className="w-full sm:w-auto"
            >
              {selectedPrescription ? 'Update' : 'Create'} Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Prescription</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this prescription? This action cannot be undone.
          </p>
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
              onClick={handleDeletePrescription}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Prescriptions; 