'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plan } from '@/types';

interface PlanCardProps {
  plan: Plan;
  onChoosePlan: (plan: Plan) => void;
}

export default function PlanCard({ plan, onChoosePlan }: PlanCardProps) {
  const isRecommended = plan.isRecommended;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative rounded-xl shadow-lg h-full flex flex-col ${isRecommended ? 'border-2 border-orange-500' : 'border'}`}
    >
      {isRecommended && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}
      <Card className="h-full flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">{plan.name}</CardTitle>
          <p className="text-4xl font-extrabold text-gray-900 my-4">{plan.price}</p>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <ul className="space-y-4 text-gray-600 mb-8 flex-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            onClick={() => onChoosePlan(plan)}
            className={`w-full mt-auto ${isRecommended ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-800 hover:bg-gray-900'} text-white font-bold py-3 rounded-lg`}
          >
            {plan.price === 'Custom' ? 'Contact Us' : 'Choose Plan'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
