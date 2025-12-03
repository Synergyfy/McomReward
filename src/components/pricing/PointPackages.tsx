'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetAvailablePointPackages } from '@/services/payment/hook';
import { PointPackage } from '@/services/payment/types';
import { Sparkles, DollarSign, Gem } from 'lucide-react';
import BuyPointPackageModal from './BuyPointPackageModal';
import LoadingSpinner from '@/components/ui/Loading';

const PointPackages: React.FC = () => {
  const { data: pointPackages, isLoading, isError } = useGetAvailablePointPackages();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PointPackage | null>(null);

  const handleBuyClick = (pkg: PointPackage) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    // Optionally refetch packages or update local state if needed
    // Invalidate the query to refetch available packages
    // queryClient.invalidateQueries(['availablePointPackages']);
    // Also invalidate any user wallet balance queries
    // queryClient.invalidateQueries(['userWallet']);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <div className="text-center text-red-500">Error loading point packages.</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Top Up Your Points
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Purchase additional point packages to reward your customers and boost your campaigns.
        </p>
      </div>

      {pointPackages && pointPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pointPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className="flex flex-col justify-between border-2 border-gray-200 hover:border-orange-500 transition-colors duration-300 shadow-lg rounded-xl"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-orange-100 rounded-full w-fit mb-4">
                  <Sparkles className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-800">{pkg.name}</CardTitle>
                <CardDescription className="text-gray-500">{pkg.description || 'Flexible points for your loyalty program.'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center text-5xl font-extrabold text-orange-600">
                  <Gem className="h-10 w-10 mr-2" />
                  {pkg.points.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Loyalty Points</p>
                <div className="flex items-baseline text-4xl font-bold text-gray-900 mt-4">
                  <DollarSign className="h-8 w-8 text-gray-600 mr-1" />
                  {parseFloat(pkg.price).toFixed(2)}
                  <span className="text-lg font-medium text-gray-500 ml-1">{pkg.currency}</span>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button
                  onClick={() => handleBuyClick(pkg)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Buy Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800">No Point Packages Available</h3>
          <p className="mt-2 text-gray-600">Please check back later or contact support for more options.</p>
        </div>
      )}

      <BuyPointPackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pointPackage={selectedPackage}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </div>
  );
};

export default PointPackages;