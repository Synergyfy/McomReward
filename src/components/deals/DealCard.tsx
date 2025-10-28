import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/lib/mock-data/deals';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  return (
    <Link href={`/deals/${deal.id}`}>
        <Card className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">{deal.businessName}</Badge>
                <CardTitle>{deal.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 line-clamp-3">{deal.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <span className="font-bold text-lg text-orange-600">{deal.value}</span>
                <Button variant="outline">View Deal</Button>
            </CardFooter>
        </Card>
    </Link>
  );
}
