'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { getApplication, updateApplication } from '@/lib/api';
import WhatsAppNotifyButton from '@/components/WhatsAppNotifyButton';
import type { Application } from '@/types';

const TEMPLATE_STORAGE_KEY = 'smc_whatsapp_templates';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  contacted: 'bg-indigo-100 text-indigo-800',
};

const notificationLabels: Record<string, string> = {
  received: 'Application Received',
  status_update: 'Status Update',
  document_reminder: 'Document Reminder',
  approval: 'Approval',
  custom: 'Custom Message',
};

const notificationColors: Record<string, string> = {
  received: 'bg-blue-100 text-blue-800',
  status_update: 'bg-green-100 text-green-800',
  document_reminder: 'bg-yellow-100 text-yellow-800',
  approval: 'bg-purple-100 text-purple-800',
  custom: 'bg-gray-100 text-gray-800',
};

const loanPurposeLabels: Record<string, string> = {
  'home-renovation': 'Home Renovation',
  'debt-consolidation': 'Debt Consolidation',
  'business-expansion': 'Business Expansion',
  education: 'Education',
  medical: 'Medical Expenses',
  vehicle: 'Vehicle Purchase',
  other: 'Other',
};

const loanAmountRangeLabels: Record<string, string> = {
  '5000-10000': 'RM 5,000 - RM 10,000',
  '10000-30000': 'RM 10,000 - RM 30,000',
  '30000-50000': 'RM 30,000 - RM 50,000',
  '50000-100000': 'RM 50,000 - RM 100,000',
  '100000+': 'RM 100,000+',
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [templates, setTemplates] = useState<{ status_update: string; custom: string }>({
    status_update: '',
    custom: '',
  });
  const [templateFeedback, setTemplateFeedback] = useState<string | null>(null);

  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '-';
    }
    return `RM ${value.toLocaleString()}`;
  };

  const formatDateValue = (value?: string) => {
    if (!value) return '-';
    try {
      return format(new Date(value), 'PPP');
    } catch {
      return value;
    }
  };

  const humanize = (value?: string) => {
    if (!value) return '-';
    return value
      .split(/[\s-_]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatLoanPurpose = (value?: string) => {
    if (!value) return '-';
    return loanPurposeLabels[value] || humanize(value);
  };

  const formatLoanRange = (value?: string) => {
    if (!value) return '-';
    return loanAmountRangeLabels[value] || value;
  };

  const getAddressLines = () => {
    if (!application?.address) return [];
    const { line1, line2, city, state, postcode } = application.address;
    const cityLine = [postcode, city].filter(Boolean).join(' ').trim();
    return [line1, line2, cityLine, state].filter((line) => line && line.toString().trim().length > 0) as string[];
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTemplates({
          status_update: parsed.status_update || '',
          custom: parsed.custom || '',
        });
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, []);

  const fetchApplication = useCallback(async () => {
    try {
      const response = await getApplication(params.id as string);
      if (response.success && response.data) {
        const app = response.data as Application;
        setApplication(app);
        setStatus(app.status);
        setNotes(app.notes || '');
      }
    } catch (error) {
      console.error('Failed to fetch application:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === 'rejected') {
      setShowRejectDialog(true);
      return;
    }

    setIsUpdating(true);
    try {
      await updateApplication(params.id as string, { status: newStatus, notes });
      setStatus(newStatus);
      setMessage({ type: 'success', text: 'Status updated successfully' });
    } catch (error) {
      console.error('Failed to update status:', error);
      setMessage({ type: 'error', text: 'Failed to update status' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    setIsUpdating(true);
    try {
      await updateApplication(params.id as string, {
        status: 'rejected',
        notes,
        rejectionReason,
      });
      setStatus('rejected');
      setShowRejectDialog(false);
      setMessage({ type: 'success', text: 'Application rejected' });
    } catch (error) {
      console.error('Failed to reject application:', error);
      setMessage({ type: 'error', text: 'Failed to reject application' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      await updateApplication(params.id as string, { notes });
      setMessage({ type: 'success', text: 'Notes saved' });
    } catch (error) {
      console.error('Failed to save notes:', error);
      setMessage({ type: 'error', text: 'Failed to save notes' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTemplateChange = (key: keyof typeof templates, value: string) => {
    setTemplates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveTemplates = () => {
    try {
      window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
      setTemplateFeedback('Templates saved locally');
      setTimeout(() => setTemplateFeedback(null), 3000);
    } catch (error) {
      console.error('Failed to save templates:', error);
      setTemplateFeedback('Failed to save templates');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-white/70 bg-white/90">
          <CardContent className="py-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <Card className="border-white/70 bg-white/90">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Application not found</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const consentItems = [
    { label: 'Terms & Conditions', value: application.termsAccepted },
    { label: 'Privacy Policy', value: application.privacyAccepted },
    { label: 'CTOS Consent', value: application.ctosConsent },
    { label: 'Marketing Updates', value: application.marketingConsent },
  ];
  const addressLines = getAddressLines();

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Button
              variant="outline"
              size="icon"
              className="mt-1 bg-white"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
                Lead detail
              </p>
              <h1 className="mt-3 text-2xl font-bold">{application.applicationId}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Submitted {format(new Date(application.createdAt), 'PPP p')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white/80">
                  {humanize(application.loanType) || 'Loan'}
                </Badge>
                {application.loanAmount ? (
                  <Badge variant="outline" className="bg-white/80">
                    {formatCurrency(application.loanAmount)}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
          <Badge
            className={`${statusColors[status] ?? 'bg-gray-100 text-gray-800'} text-base px-4 py-1`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </CardContent>
      </Card>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Application Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="font-medium">{application.fullName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">IC Number</Label>
                <p className="font-medium font-mono">
                  {application.icNumberMasked || '******'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Date of Birth</Label>
                <p className="font-medium">{formatDateValue(application.dateOfBirth)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Gender</Label>
                <p className="font-medium capitalize">{humanize(application.gender)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Marital Status</Label>
                <p className="font-medium capitalize">{humanize(application.maritalStatus)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Nationality</Label>
                <p className="font-medium">{application.nationality || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {application.phone}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {application.email}
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-medium whitespace-pre-line">
                  {addressLines.length ? addressLines.join('\n') : '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Employment Status</Label>
                <p className="font-medium capitalize">{humanize(application.employmentStatus)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Company</Label>
                <p className="font-medium">{application.companyName || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Position</Label>
                <p className="font-medium">{application.position || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Years Employed</Label>
                <p className="font-medium">
                  {typeof application.yearsEmployed === 'number' ? `${application.yearsEmployed} years` : '-'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Employer Phone</Label>
                <p className="font-medium">{application.employerPhone || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Monthly Income</Label>
                <p className="font-medium text-green-600">
                  {formatCurrency(application.monthlyIncome)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Loan Details */}
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Loan Type</Label>
                <p className="font-medium">{humanize(application.loanType)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Requested Amount</Label>
                <p className="font-medium text-xl text-primary">
                  {formatCurrency(application.loanAmount)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Loan Term</Label>
                <p className="font-medium">
                  {typeof application.loanTerm === 'number' ? `${application.loanTerm} months` : '-'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Monthly Payment</Label>
                <p className="font-medium text-primary">
                  {formatCurrency(application.monthlyPayment)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Loan Purpose</Label>
                <p className="font-medium">{formatLoanPurpose(application.loanPurpose)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount Range</Label>
                <p className="font-medium">{formatLoanRange(application.loanAmountRange)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Consent & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {consentItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-border/70 p-3"
                >
                  <div>
                    <Label className="text-muted-foreground">{item.label}</Label>
                    <p className="font-medium">
                      {item.value ? 'Granted' : 'Not granted'}
                    </p>
                  </div>
                  {item.value ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>WhatsApp Notification History</CardTitle>
              <CardDescription>Track all outgoing messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!application.notifications || application.notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications have been sent.</p>
              ) : (
                <div className="space-y-4">
                  {application.notifications.map((notification) => (
                    <div
                      key={notification._id || notification.sentAt}
                      className="rounded-lg border border-border/60 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge className={notificationColors[notification.type]}>
                          {notificationLabels[notification.type] || notification.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.sentAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Channel: {notification.channel.toUpperCase()}
                        {notification.sentBy?.name && ` • Sent by ${notification.sentBy.name}`}
                      </p>
                      {typeof notification.meta?.message === 'string' && notification.meta.message && (
                        <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm whitespace-pre-line">
                          {notification.meta.message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change the application status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={status === 'processing' ? 'default' : 'outline'}
                  className="w-full"
                  disabled={isUpdating || status === 'approved' || status === 'rejected'}
                  onClick={() => handleStatusUpdate('processing')}
                >
                  Processing
                </Button>
                <Button
                  variant={status === 'approved' ? 'default' : 'outline'}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isUpdating || status === 'approved' || status === 'rejected'}
                  onClick={() => handleStatusUpdate('approved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>

              <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={isUpdating || status === 'approved' || status === 'rejected'}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Application</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for rejection
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Rejection reason..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={!rejectionReason || isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Confirm Rejection'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* WhatsApp Notification */}
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Notify Applicant</CardTitle>
              <CardDescription>Send WhatsApp notification</CardDescription>
            </CardHeader>
            <CardContent>
              <WhatsAppNotifyButton
                applicationId={application._id}
                templates={templates}
                onSent={fetchApplication}
              />
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Customize default WhatsApp copy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templateFeedback && (
                <Alert variant="default">
                  <AlertDescription>{templateFeedback}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Status Update Template</Label>
                <Textarea
                  rows={4}
                  value={templates.status_update}
                  onChange={(e) => handleTemplateChange('status_update', e.target.value)}
                  placeholder="Hi {{name}}, your application status is now..."
                />
              </div>
              <div className="space-y-2">
                <Label>Custom Message Template</Label>
                <Textarea
                  rows={4}
                  value={templates.custom}
                  onChange={(e) => handleTemplateChange('custom', e.target.value)}
                  placeholder="Enter frequently used custom message..."
                />
              </div>
              <Button className="w-full" variant="outline" onClick={handleSaveTemplates}>
                Save Templates
              </Button>
              <p className="text-xs text-muted-foreground">
                Templates are stored locally per browser to help you re-use messaging.
              </p>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-white/70 bg-white/90">
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add notes about this application..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <Button className="w-full" onClick={handleSaveNotes} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Notes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
