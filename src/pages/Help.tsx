import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';

const Help = () => {
  return (
    <>
      <Helmet>
        <title>Help & Support | ClinicFlow</title>
      </Helmet>
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">Help & Support</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to the ClinicFlow help center. Here you'll find guides and information to help you use our platform effectively.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
                <p className="text-gray-600 mb-4">Learn the basics of setting up your clinic and navigating the platform.</p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Setting up your account</li>
                  <li>• Configuring your clinic profile</li>
                  <li>• Understanding the dashboard</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Patient Management</h2>
                <p className="text-gray-600 mb-4">Learn how to manage patient records effectively.</p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Adding new patients</li>
                  <li>• Updating patient information</li>
                  <li>• Managing patient history</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Appointments</h2>
                <p className="text-gray-600 mb-4">Everything you need to know about managing appointments.</p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Scheduling appointments</li>
                  <li>• Managing the calendar</li>
                  <li>• Setting up online booking</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Billing & Invoices</h2>
                <p className="text-gray-600 mb-4">Learn about creating and managing invoices.</p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Creating invoices</li>
                  <li>• Processing payments</li>
                  <li>• Generating financial reports</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h2 className="text-xl font-semibold mb-4">Need Additional Help?</h2>
              <p className="mb-4">
                If you can't find the information you're looking for, our support team is here to help.
              </p>
              <p className="font-medium">
                Contact us at: <a href="mailto:support@clinicflow.com" className="text-blue-600 hover:text-blue-800">support@clinicflow.com</a>
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Help; 