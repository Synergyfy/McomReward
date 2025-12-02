import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send } from 'lucide-react';

export default function SupportTicketForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Support</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" placeholder="e.g., Issue with my campaign" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Please describe your issue in detail..." rows={6} />
        </div>
        <div className="flex justify-between items-center">
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Submit Ticket
          </Button>
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Live Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
