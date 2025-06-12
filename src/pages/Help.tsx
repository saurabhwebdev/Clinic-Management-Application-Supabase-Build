import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientHelp, AppointmentHelp, GettingStartedHelp, PrescriptionHelp } from '@/components/help';
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
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium text-lg mb-3">Help Topics</h3>
                <nav className="flex flex-col space-y-1">
                  <Button 
                    variant={activeTab === "overview" ? "secondary" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("overview")}
                  >
                    Overview
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                  <Button 
                    variant={activeTab === "getting-started" ? "secondary" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("getting-started")}
                  >
                    Getting Started
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                  <Button 
                    variant={activeTab === "patients" ? "secondary" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("patients")}
                  >
                    Patient Management
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                  <Button 
                    variant={activeTab === "appointments" ? "secondary" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("appointments")}
                  >
                    Appointments
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                  <Button 
                    variant={activeTab === "prescriptions" ? "secondary" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("prescriptions")}
                  >
                    Prescriptions
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                  <Button 
                    variant={activeTab === "billing" ? "secondary" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("billing")}
                  >
                    Billing & Invoices
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                  <Button 
                    variant={activeTab === "contact" ? "secondary" : "ghost"} 
                    className="justify-start" 
                    onClick={() => setActiveTab("contact")}
                  >
                    Contact Support
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              {activeTab === "overview" && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold mb-4">ClinicFlow Help Center</h2>
                  <p className="text-gray-600 mb-6">
                    Welcome to the ClinicFlow help center. Here you'll find guides and information to help you use our platform effectively.
                  </p>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-3">Popular Help Topics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => setActiveTab("getting-started")}
                    >
                      <h4 className="font-medium text-lg mb-2">Getting Started</h4>
                      <p className="text-sm text-gray-600">Learn how to set up your account and clinic profile.</p>
                    </div>
                    <div 
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => setActiveTab("patients")}
                    >
                      <h4 className="font-medium text-lg mb-2">Patient Management</h4>
                      <p className="text-sm text-gray-600">Learn how to add and manage patient records.</p>
                    </div>
                    <div 
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => setActiveTab("appointments")}
                    >
                      <h4 className="font-medium text-lg mb-2">Appointments</h4>
                      <p className="text-sm text-gray-600">Learn how to schedule and manage appointments.</p>
                    </div>
                    <div 
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => setActiveTab("prescriptions")}
                    >
                      <h4 className="font-medium text-lg mb-2">Prescriptions</h4>
                      <p className="text-sm text-gray-600">Learn how to create and manage digital prescriptions.</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mt-8 mb-3">Need More Help?</h3>
                  <p className="text-gray-600 mb-4">
                    If you can't find what you're looking for in our help center, our support team is here to help.
                  </p>
                  <div 
                    className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => setActiveTab("contact")}
                  >
                    <h4 className="font-medium text-lg mb-2">Contact Support</h4>
                    <p className="text-sm text-gray-600">Get in touch with our support team for personalized assistance.</p>
                  </div>
                </div>
              )}
              
              {activeTab === "getting-started" && <GettingStartedHelp />}
              {activeTab === "patients" && <PatientHelp />}
              {activeTab === "appointments" && <AppointmentHelp />}
              {activeTab === "prescriptions" && <PrescriptionHelp />}
              
              {activeTab === "billing" && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold mb-4">Billing & Invoices</h2>
                  <p className="text-gray-600 mb-6">
                    This section is currently under development. Please check back later for information on managing billing and invoices.
                  </p>
                </div>
              )}
              
              {activeTab === "contact" && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold mb-4">Contact Support</h2>
                  <p className="text-gray-600 mb-6">
                    Need help with something specific? Our support team is here to assist you.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium text-lg mb-3">Email Support</h3>
                      <p className="text-gray-600 mb-4">
                        Send us an email and we'll get back to you within 24 hours.
                      </p>
                      <a 
                        href="mailto:support@clinicflow.com" 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      >
                        Email Support
                      </a>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="font-medium text-lg mb-3">Live Chat</h3>
                      <p className="text-gray-600 mb-4">
                        Chat with our support team during business hours.
                      </p>
                      <button 
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      >
                        Start Chat
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-lg mb-3">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">What are your support hours?</h4>
                        <p className="text-gray-600">Our support team is available Monday through Friday, 9am to 5pm EST.</p>
                      </div>
                      <div>
                        <h4 className="font-medium">How quickly will I receive a response?</h4>
                        <p className="text-gray-600">We aim to respond to all inquiries within 24 hours during business days.</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Do you offer phone support?</h4>
                        <p className="text-gray-600">Phone support is available for premium subscribers. Please contact us via email for details.</p>
                      </div>
                    </div>
                  </div>
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