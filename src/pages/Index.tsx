import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 md:py-6 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                    Streamline Your Clinic Operations
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    ClinicFlow is a comprehensive management solution designed specifically for small and medium-sized clinics. Simplify appointments, patient records, billing, and more.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button className="px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline" className="px-8 py-3 border border-black text-black font-medium rounded-md hover:bg-gray-100 transition-colors">
                      Book a Demo
                    </Button>
                  </Link>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-500">
                    Trusted by over 500+ healthcare providers across the country
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <span className="text-lg">Clinic Dashboard Preview Image</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
