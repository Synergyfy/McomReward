'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, MessageCircle, FileText, ExternalLink } from 'lucide-react';

export default function HelpPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
                <p className="text-muted-foreground">Get help with your plaque and dashboard.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Guides</CardTitle>
                            <CardDescription>Common questions and how-to guides.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>How to place a plaque?</AccordionTrigger>
                                    <AccordionContent>
                                        Place your plaque in a high-visibility area near the entrance or checkout counter. Ensure it is at eye level and well-lit.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>How NFC works?</AccordionTrigger>
                                    <AccordionContent>
                                        NFC allows customers to tap their phone against the plaque to open the link. Most modern smartphones support this without any app.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>How to share your link?</AccordionTrigger>
                                    <AccordionContent>
                                        Go to the "Share & Campaigns" page to copy your unique link or share directly to social media.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4">
                                    <AccordionTrigger>My plaque is not scanning</AccordionTrigger>
                                    <AccordionContent>
                                        Ensure the QR code is not damaged or covered. If the NFC is not working, try tapping the top back of your phone against the plaque logo.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <FileText className="mr-2 h-4 w-4" /> Download User Manual
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <ExternalLink className="mr-2 h-4 w-4" /> Visit Knowledge Base
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Support</CardTitle>
                            <CardDescription>Send us a message and we'll get back to you.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" placeholder="e.g. Broken Plaque" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Describe your issue..." className="min-h-[100px]" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="file">Attach Image (Optional)</Label>
                                    <Input id="file" type="file" />
                                </div>
                                <Button className="w-full">Send Message</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-100">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-blue-900">Live Chat</h3>
                                <p className="text-sm text-blue-700">Chat with a support agent now.</p>
                            </div>
                            <Button>
                                <MessageCircle className="mr-2 h-4 w-4" /> Start Chat
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
