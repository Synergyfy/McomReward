'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Hash, Hand, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';

export default function EarnPointsPage() {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEnterCodeModalOpen, setIsEnterCodeModalOpen] = useState(false);
  const [isMerchantEnterCodeModalOpen, setIsMerchantEnterCodeModalOpen] = useState(false);
  const [isCustomerNumberModalOpen, setIsCustomerNumberModalOpen] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1'); // Default country code

  const earnMethods = [
    {
      icon: QrCode,
      title: 'QR Code',
      description: 'Present your unique QR code to the merchant for scanning.',
      action: () => setIsQrModalOpen(true),
    },
    {
      icon: Hash,
      title: 'Enter Code',
      description: 'Enter a code provided by the merchant to earn points.',
      action: () => setIsEnterCodeModalOpen(true),
    },
    {
      icon: Hand,
      title: 'Merchant Enters Code',
      description: 'Allow the merchant to enter a secure code on your device.',
      action: () => setIsMerchantEnterCodeModalOpen(true),
    },
    {
      icon: User,
      title: 'Customer Number',
      description: 'Provide your customer number to the merchant to add points.',
      action: () => setIsCustomerNumberModalOpen(true),
    },
  ];

  const handleCodeSubmit = () => {
    console.log('Code Submitted:', enteredCode);
    // Here you would typically send the code to your backend
    setIsEnterCodeModalOpen(false);
    setEnteredCode('');
  };

  const handleCustomerNumberSubmit = () => {
    console.log('Customer Number Submitted:', countryCode, customerNumber);
    // Here you would typically send the customer number and country code to your backend
    setIsCustomerNumberModalOpen(false);
    setCustomerNumber('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Earn Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {earnMethods.map((method, index) => (
            <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gray-100 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-600 text-white p-3 rounded-full">
                    <method.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">{method.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-lg text-gray-700 mb-6 h-20">
                  {method.description}
                </CardDescription>
                <Button 
                  onClick={method.action} 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Use {method.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your QR Code</DialogTitle>
            <DialogDescription>
              Show QR Code to merchant
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <Image 
              src="/placeholder-qr.svg" 
              alt="QR Code" 
              width={200} 
              height={200} 
              className="w-48 h-48"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Enter Code Modal */}
      <Dialog open={isEnterCodeModalOpen} onOpenChange={setIsEnterCodeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Code</DialogTitle>
            <DialogDescription>
              Please enter the code provided by the merchant.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCodeSubmit}>Submit Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merchant Enters Code Modal */}
      <Dialog open={isMerchantEnterCodeModalOpen} onOpenChange={setIsMerchantEnterCodeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Merchant Enters Code</DialogTitle>
            <DialogDescription>
              Please hand your device to the merchant so they can enter the code.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4 text-lg font-semibold text-gray-700">
            Waiting for merchant...
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Number Modal */}
      <Dialog open={isCustomerNumberModalOpen} onOpenChange={setIsCustomerNumberModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Customer Number</DialogTitle>
            <DialogDescription>
              Please provide your customer number and select your country code.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="countryCode" className="text-right">
                Country Code
              </Label>
              <Select onValueChange={setCountryCode} defaultValue={countryCode}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a country code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">+1 (USA)</SelectItem>
                  <SelectItem value="+44">+44 (UK)</SelectItem>
                  <SelectItem value="+44gb">+44 (Great Britain)</SelectItem>
                  <SelectItem value="+91">+91 (India)</SelectItem>
                  <SelectItem value="+234">+234 (Nigeria)</SelectItem>
                  <SelectItem value="+61">+61 (Australia)</SelectItem>
                  <SelectItem value="+81">+81 (Japan)</SelectItem>
                  <SelectItem value="+33">+33 (France)</SelectItem>
                  <SelectItem value="+49">+49 (Germany)</SelectItem>
                  <SelectItem value="+86">+86 (China)</SelectItem>
                  <SelectItem value="+52">+52 (Mexico)</SelectItem>
                  <SelectItem value="+55">+55 (Brazil)</SelectItem>
                  {/* Add more country codes as needed */}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerNumber" className="text-right">
                Customer Number
              </Label>
              <Input
                id="customerNumber"
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 1234567890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCustomerNumberSubmit}>Submit Customer Number</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
