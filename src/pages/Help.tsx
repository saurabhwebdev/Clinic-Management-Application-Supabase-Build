import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientHelp } from '@/components/help';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const Help = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");

  return (
    <>
      <Helmet>
        <title>Help & Support | ClinicFlow</title>
      </Helmet>
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Help & Support</h1>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 shrink-0">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm sticky top-24">
                <h3 className="font-medium text-lg mb-4">Help Topics</h3>
                <nav className="space-y-1">
                  <Button 
                    variant={activeTab === "overview" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("overview")}
                  >
                    Overview
                  </Button>
                  <Button 
                    variant={activeTab === "patients" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("patients")}
                  >
                    Patient Management
                  </Button>
                  <Button 
                    variant={activeTab === "appointments" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("appointments")}
                    disabled
                  >
                    Appointments
                  </Button>
                  <Button 
                    variant={activeTab === "prescriptions" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("prescriptions")}
                    disabled
                  >
                    Prescriptions
                  </Button>
                  <Button 
                    variant={activeTab === "invoices" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("invoices")}
                    disabled
                  >
                    Billing & Invoices
                  </Button>
                  <Button 
                    variant={activeTab === "settings" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                    disabled
                  >
                    Settings
                  </Button>
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-medium mb-3">Need More Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Contact our support team for assistance with any issues not covered in the help documentation.
                  </p>
                  <a 
                    href="mailto:support@clinicflow.com" 
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    Contact Support <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {activeTab === "overview" && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold">Welcome to ClinicFlow Help</h2>
                  <p className="text-gray-600 mb-6">
                    Welcome to the ClinicFlow help center. Here you'll find guides and information to help you use our platform effectively.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
                      <p className="text-gray-600 mb-4">Learn the basics of setting up your clinic and navigating the platform.</p>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Setting up your account</li>
                        <li>• Configuring your clinic profile</li>
                        <li>• Understanding the dashboard</li>
                      </ul>
                    </div>
                    
                    <div 
                      className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                      onClick={() => setActiveTab("patients")}
                    >
                      <h3 className="text-xl font-semibold mb-4">Patient Management</h3>
                      <p className="text-gray-600 mb-4">Learn how to manage patient records effectively.</p>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Adding new patients</li>
                        <li>• Updating patient information</li>
                        <li>• Managing patient history</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-semibold mb-4">Appointments</h3>
                      <p className="text-gray-600 mb-4">Everything you need to know about managing appointments.</p>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Scheduling appointments</li>
                        <li>• Managing the calendar</li>
                        <li>• Setting up online booking</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-xl font-semibold mb-4">Billing & Invoices</h3>
                      <p className="text-gray-600 mb-4">Learn about creating and managing invoices.</p>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Creating invoices</li>
                        <li>• Processing payments</li>
                        <li>• Generating financial reports</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="text-xl font-semibold mb-4">Need Additional Help?</h3>
                    <p className="mb-4">
                      If you can't find the information you're looking for, our support team is here to help.
                    </p>
                    <p className="font-medium">
                      Contact us at: <a href="mailto:support@clinicflow.com" className="text-blue-600 hover:text-blue-800">support@clinicflow.com</a>
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "patients" && <PatientHelp />}
              
              {/* Other module help content will be conditionally rendered here */}
              {activeTab === "appointments" && (
                <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                  <p className="text-gray-500">Appointments help content coming soon.</p>
                </div>
              )}

              {activeTab === "prescriptions" && (
                <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                  <p className="text-gray-500">Prescriptions help content coming soon.</p>
                </div>
              )}

              {activeTab === "invoices" && (
                <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                  <p className="text-gray-500">Billing & Invoices help content coming soon.</p>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                  <p className="text-gray-500">Settings help content coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Help; 