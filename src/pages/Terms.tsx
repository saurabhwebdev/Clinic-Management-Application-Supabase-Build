import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | ClinicFlow</title>
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing or using ClinicFlow, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p className="mb-4">
              ClinicFlow is a practice management platform for healthcare providers that includes patient management, appointment scheduling, prescription tracking, and invoicing capabilities.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Privacy</h2>
            <p className="mb-4">
              Our Privacy Policy governs the collection, use, and disclosure of personal information. By using ClinicFlow, you consent to our privacy practices as described in our Privacy Policy.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Compliance with Healthcare Regulations</h2>
            <p className="mb-4">
              Users are responsible for ensuring their use of ClinicFlow complies with all applicable healthcare regulations, including but not limited to HIPAA (in the United States) or equivalent regulations in other jurisdictions.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Limitations of Liability</h2>
            <p className="mb-4">
              ClinicFlow is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of our service.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Continued use of ClinicFlow after changes constitutes acceptance of the modified terms.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at support@clinicflow.com.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Terms; 