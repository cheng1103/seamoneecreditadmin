'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface WhatsAppNotifyButtonProps {
  applicationId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  templates?: Record<string, string>;
  onSent?: () => void;
}

export default function WhatsAppNotifyButton({
  applicationId,
  variant = 'outline',
  size = 'default',
  templates,
  onSent,
}: WhatsAppNotifyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notificationType, setNotificationType] = useState('status_update');
  const [customMessage, setCustomMessage] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const editableTypes = ['custom', 'status_update'];

  const handleOpen = () => {
    setNotificationType('status_update');
    setCustomMessage(templates?.status_update || '');
    setResult(null);
    setIsOpen(true);
  };

  const handleNotificationTypeChange = (value: string) => {
    setNotificationType(value);
    if (editableTypes.includes(value)) {
      setCustomMessage(templates?.[value] || '');
    } else {
      setCustomMessage('');
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/admin/whatsapp/notify-application/${applicationId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationType,
            customMessage: editableTypes.includes(notificationType)
              ? customMessage.trim()
              : undefined,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, message: 'WhatsApp notification sent successfully!' });
        onSent?.();
        setTimeout(() => {
          setIsOpen(false);
          setResult(null);
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send notification',
        });
      }
    } catch (error) {
      console.error('WhatsApp notify error:', error);
      setResult({ success: false, message: 'Failed to send notification. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  const notificationTypes = [
    { value: 'received', label: 'Application Received' },
    { value: 'status_update', label: 'Status Update' },
    { value: 'document_reminder', label: 'Document Reminder' },
    { value: 'approval', label: 'Approval Notification' },
    { value: 'custom', label: 'Custom Message' },
  ];

  return (
    <>
      <Button variant={variant} size={size} onClick={handleOpen}>
        <MessageCircle className="h-4 w-4 mr-2" />
        WhatsApp
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              Send WhatsApp Notification
            </DialogTitle>
            <DialogDescription>
              Send a WhatsApp notification to the applicant about their loan application.
            </DialogDescription>
          </DialogHeader>

          {result ? (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                result.success ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.message}
              </span>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <Select value={notificationType} onValueChange={handleNotificationTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editableTypes.includes(notificationType) && (
                <div className="space-y-2">
                  <Label>{notificationType === 'custom' ? 'Custom Message' : 'Status Update Template'}</Label>
                  <Textarea
                    placeholder="Enter your message..."
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                  />
                </div>
              )}

              <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                <strong>Note:</strong> Messages will be sent in both English and Malay.
                Make sure the applicant&apos;s phone number is correct.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            {!result && (
              <Button
                onClick={handleSend}
                disabled={isSending || (notificationType === 'custom' && !customMessage.trim())}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
