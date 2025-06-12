import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Users, Receipt, Package, FileText, AlertCircle, CalendarPlus } from 'lucide-react';
import PendingBookings from '@/components/PendingBookings';

// Define interfaces
interface DashboardStats {
  appointmentsCount: number;
  patientsCount: number;
  invoicesTotal: number;
  invoicesPending: number;
  lowStockCount: number;
  prescriptionsCount: number;
  pendingBookingsCount: number;
}

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  status: string;
  patient: {
    first_name: string;
    last_name: string;
  };
}

interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  reorder_level: number | null;
  unit: string | null;
}

interface Region {
  id: string;
  name: string;
  country: string;
  city: string | null;
  currency_code: string;
  currency_symbol: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    appointmentsCount: 0,
    patientsCount: 0,
    invoicesTotal: 0,
    invoicesPending: 0,
    lowStockCount: 0,
    prescriptionsCount: 0,
    pendingBookingsCount: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [userRegion, setUserRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRegion();
      fetchDashboardData();
    }
  }, [user]);

  // Fetch user's region settings
  const fetchUserRegion = async () => {
    try {
      // Get user's region ID
      const { data: userRegionData, error: userRegionError } = await supabase
        .from('user_regions')
        .select('region_id')
        .eq('user_id', user?.id)
        .single();
      
      if (userRegionError && userRegionError.code !== 'PGRST116') {
        throw userRegionError;
      }
      
      if (userRegionData?.region_id) {
        // Get region details
        const { data: regionData, error: regionError } = await supabase
          .from('regions')
          .select('*')
          .eq('id', userRegionData.region_id)
          .single();
        
        if (regionError) throw regionError;
        
        setUserRegion(regionData);
      }
    } catch (error) {
      console.error('Error fetching user region:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch appointments count
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'scheduled');
      
      if (appointmentsError) throw appointmentsError;

      // Fetch recent appointments
      const { data: recentAppointmentsData, error: recentAppointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          start_time,
          status,
          patient:patients(first_name, last_name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);

      if (recentAppointmentsError) throw recentAppointmentsError;

      // Fetch patients count
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id);
      
      if (patientsError) throw patientsError;

      // Fetch invoices stats
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, total_amount, status')
        .eq('user_id', user.id);
      
      if (invoicesError) throw invoicesError;

      const invoicesTotal = invoicesData?.reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0;
      const invoicesPending = invoicesData?.filter(invoice => invoice.status === 'pending').length || 0;

      // Fetch low stock inventory items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id);
      
      if (inventoryError) throw inventoryError;

      // Get low stock items by comparing quantity with reorder_level
      const lowStock = inventoryData?.filter(item => 
        item.quantity <= (item.reorder_level || 0)
      ) || [];

      // Fetch prescriptions count
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('id')
        .eq('user_id', user.id);
      
      if (prescriptionsError) throw prescriptionsError;
      
      // Fetch pending booking requests count
      const { data: pendingBookingsData, error: pendingBookingsError } = await supabase
        .from('public_booking_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending');
      
      if (pendingBookingsError) throw pendingBookingsError;

      setStats({
        appointmentsCount: appointmentsData?.length || 0,
        patientsCount: patientsData?.length || 0,
        invoicesTotal,
        invoicesPending,
        lowStockCount: lowStock.length,
        prescriptionsCount: prescriptionsData?.length || 0,
        pendingBookingsCount: pendingBookingsData?.length || 0
      });

      // Type assertion to avoid TypeScript errors
      setRecentAppointments(recentAppointmentsData ? [...recentAppointmentsData] : []);
      setLowStockItems(lowStock ? [...lowStock] : []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency using user's region settings
  const formatCurrency = (amount: number): string => {
    if (userRegion) {
      try {
        // First try to use the Intl.NumberFormat with the currency code
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: userRegion.currency_code,
          currencyDisplay: 'symbol',
        }).format(amount);
      } catch (error) {
        // If that fails (e.g., for unsupported currency codes), use the symbol directly
        return `${userRegion.currency_symbol}${amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      }
    }
    
    // Default fallback if no region is set
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/appointments">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Appointments</CardTitle>
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{loading ? '...' : stats.appointmentsCount}</div>
                  <p className="text-sm text-gray-500">Upcoming appointments</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/patients">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Patients</CardTitle>
                  <Users className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{loading ? '...' : stats.patientsCount}</div>
                  <p className="text-sm text-gray-500">Registered patients</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/invoices">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Billing</CardTitle>
                  <Receipt className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{loading ? '...' : formatCurrency(stats.invoicesTotal)}</div>
                  <p className="text-sm text-gray-500">{stats.invoicesPending} pending invoices</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : recentAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{appointment.patient.first_name} {appointment.patient.last_name}</p>
                          <p className="text-sm text-gray-500">{formatDate(appointment.date)} at {appointment.start_time}</p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No upcoming appointments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Inventory Alerts</CardTitle>
                  <CardDescription>Items with low stock</CardDescription>
                </div>
                {stats.lowStockCount > 0 && (
                  <div className="bg-red-100 p-1 rounded-full">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : lowStockItems.length > 0 ? (
                  <div className="space-y-4">
                    {lowStockItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.category || 'No category'}</p>
                        </div>
                        <div>
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            {item.quantity} / {item.reorder_level} {item.unit || 'units'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No low stock items</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/prescriptions">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Prescriptions</CardTitle>
                  <FileText className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{loading ? '...' : stats.prescriptionsCount}</div>
                  <p className="text-sm text-gray-500">Total prescriptions</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/inventory">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Inventory</CardTitle>
                  <Package className="h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{loading ? '...' : stats.lowStockCount}</div>
                  <p className="text-sm text-gray-500">Items with low stock</p>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          {/* Pending Booking Requests */}
          {stats.pendingBookingsCount > 0 && (
            <div className="grid grid-cols-1 gap-6">
              <PendingBookings onRefreshNeeded={fetchDashboardData} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 