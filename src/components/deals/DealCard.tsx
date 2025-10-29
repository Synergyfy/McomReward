import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/lib/mock-data/deals';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  return (
    <Link href={`/deals/${deal.id}`} className="block group">
        <Card className="flex flex-col justify-between h-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                    <Image
                        src={deal.imageUrl}
                        alt={deal.title}
                        layout="fill"
                        objectFit="cover"
                    />
                    <Badge variant="secondary" className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm">{deal.category}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-bold leading-tight group-hover:text-orange-600 transition-colors duration-300">{deal.title}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{deal.businessName}</p>
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center bg-gray-50/50">
                <span className="font-bold text-xl text-gray-800">{deal.value}</span>
                <Button variant="outline" className="group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">View Deal</Button>
            </CardFooter>
        </Card>
    </Link>
  );
}
