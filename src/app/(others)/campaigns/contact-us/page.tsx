'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, ArrowUpRight } from "lucide-react";

const contactMethods = [
  {
    icon: Phone,
    title: 'Call Us',
    contact: '+1 (555) 123-4567',
    link: 'tel:+15551234567',
  },
  {
    icon: Mail,
    title: 'Email Us',
    contact: 'support@mcomloyalty.com',
    link: 'mailto:support@mcomloyalty.com',
  },
];

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Contact Methods */}
        <div className="space-y-8">
          {contactMethods.map((method, index) => (
            <a href={method.link} key={index} className="block group">
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 hover:border-orange-600 border-2 border-transparent">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="bg-orange-600 text-white p-4 rounded-full">
                      <method.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-800">{method.title}</CardTitle>
                      <p className="text-lg text-gray-600">{method.contact}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-8 w-8 text-gray-400 group-hover:text-orange-600 transition-colors duration-300" />
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
