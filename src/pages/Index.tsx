import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/AuthContext';
import { 
  Calendar, 
  Users, 
  Pill, 
  Receipt, 
  Package, 
  FileBarChart, 
  ArrowRight, 
  Check, 
  ChevronRight
} from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#f3f4f6_0%,_transparent_60%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-5">
                  <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900">
                    Modern Clinic Management, <span className="text-black">Simplified</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    ClinicFlow streamlines your practice with an all-in-one solution for appointments, 
                    patient records, prescriptions, billing, and inventory management.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  {user ? (
                    <Link to="/dashboard">
                      <Button className="px-8 py-6 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/signup">
                        <Button className="px-8 py-6 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors">
                          Get Started
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link to="/signin">
                        <Button variant="outline" className="px-8 py-6 border border-black text-black font-medium rounded-md hover:bg-gray-100 transition-colors">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    Trusted by 500+ healthcare providers across the country
                  </p>
                </div>
              </div>
              <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
                  <img 
                    src="/placeholder.svg" 
                    alt="ClinicFlow Dashboard Preview" 
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Run Your Clinic</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ClinicFlow combines all essential tools in one intuitive platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-gray-100 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Scheduling</h3>
              <p className="text-gray-600 mb-6">
                Intelligent appointment booking with automated reminders and online scheduling for patients.
              </p>
              <Link to="/appointments" className="inline-flex items-center text-sm font-medium text-black hover:underline">
                Learn more <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-gray-100 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Patient Management</h3>
              <p className="text-gray-600 mb-6">
                Comprehensive patient records with medical history, documents, and secure communication.
              </p>
              <Link to="/patients" className="inline-flex items-center text-sm font-medium text-black hover:underline">
                Learn more <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-gray-100 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-6">
                <Pill className="h-7 w-7 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Prescription Management</h3>
              <p className="text-gray-600 mb-6">
                Create, manage, and track prescriptions with drug interaction checks and refill tracking.
              </p>
              <Link to="/prescriptions" className="inline-flex items-center text-sm font-medium text-black hover:underline">
                Learn more <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-gray-100 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-6">
                <Receipt className="h-7 w-7 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Billing & Invoicing</h3>
              <p className="text-gray-600 mb-6">
                Streamlined billing with insurance processing, payment tracking, and financial reporting.
              </p>
              <Link to="/invoices" className="inline-flex items-center text-sm font-medium text-black hover:underline">
                Learn more <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-gray-100 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-6">
                <Package className="h-7 w-7 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Inventory Control</h3>
              <p className="text-gray-600 mb-6">
                Track medical supplies and medications with automated reordering and expiry date monitoring.
              </p>
              <Link to="/inventory" className="inline-flex items-center text-sm font-medium text-black hover:underline">
                Learn more <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-gray-100 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-6">
                <FileBarChart className="h-7 w-7 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics & Reports</h3>
              <p className="text-gray-600 mb-6">
                Insightful reports on clinic performance, patient trends, and financial metrics.
              </p>
              <Link to="/reports" className="inline-flex items-center text-sm font-medium text-black hover:underline">
                Learn more <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to transform your clinic operations?
              </h2>
              <p className="text-lg text-gray-300">
                Join thousands of healthcare providers who've simplified their practice management with ClinicFlow.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                <Link to="/signup">
                  <Button className="w-full sm:w-auto px-8 py-6 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors">
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/help">
                  <Button className="w-full sm:w-auto px-8 py-6 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-700 transition-colors">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white/10 rounded-xl p-6">
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="ml-3 text-white">No credit card required to start</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="ml-3 text-white">14-day free trial with full access</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="ml-3 text-white">Dedicated support during onboarding</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <p className="ml-3 text-white">Easy data migration from other systems</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
