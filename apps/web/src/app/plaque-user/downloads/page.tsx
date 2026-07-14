'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Printer, FileText, Image as ImageIcon } from 'lucide-react';

export default function DownloadsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Downloads & Print</h1>
                <p className="text-muted-foreground">Get print-ready files for your plaque.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Printable PDF</CardTitle>
                        <CardDescription>Best for printing on paper or stickers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="aspect-[1/1.4] bg-gray-100 rounded-lg border flex items-center justify-center">
                            <FileText className="h-16 w-16 text-gray-400" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="instructions" defaultChecked />
                                <Label htmlFor="instructions">Include installation instructions</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="serial" defaultChecked />
                                <Label htmlFor="serial">Include serial number & seller name</Label>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button className="flex-1">
                                <Download className="mr-2 h-4 w-4" /> Download A4 PDF
                            </Button>
                            <Button variant="outline" className="flex-1">
                                <Download className="mr-2 h-4 w-4" /> Download A5 PDF
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Digital Image (PNG)</CardTitle>
                        <CardDescription>Best for sharing online or custom designs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="aspect-square bg-gray-100 rounded-lg border flex items-center justify-center">
                            <ImageIcon className="h-16 w-16 text-gray-400" />
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                High-resolution PNG image with transparent background. Includes the QR code and your plaque ID.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="mr-2 h-4 w-4" /> Download Small (500px)
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="mr-2 h-4 w-4" /> Download Medium (1000px)
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="mr-2 h-4 w-4" /> Download Large (2000px)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
