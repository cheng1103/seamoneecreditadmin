'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Loader2, MoreHorizontal, Mail, Phone, User, RefreshCcw } from 'lucide-react';
import { getContacts, updateContact } from '@/lib/api';
import ExportButton from '@/components/ExportButton';
import type { Contact } from '@/types';

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Read', value: 'read' },
  { label: 'Replied', value: 'replied' },
  { label: 'Archived', value: 'archived' },
];

const statusClasses: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  read: 'bg-yellow-100 text-yellow-800',
  replied: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<Contact['status']>('new');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: pagination.limit.toString(),
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (appliedSearch.trim()) params.search = appliedSearch.trim();

      const response = await getContacts(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch contacts');
      }
      if (response.data) {
        setContacts(response.data as Contact[]);
      }
      if (response.pagination) {
        setPagination({
          total: response.pagination.total,
          pages: response.pagination.pages,
          limit: response.pagination.limit,
        });
      }
      if (response.statusCounts) {
        setStatusCounts(response.statusCounts);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setIsLoading(false);
    }
  }, [page, pagination.limit, statusFilter, appliedSearch]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchContacts();
  };

  const openContactDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setReplyMessage(contact.replyMessage || '');
    setStatusUpdate(contact.status);
    setDialogOpen(true);
  };

  const handleStatusChange = async (contact: Contact, newStatus: Contact['status']) => {
    if (contact.status === newStatus) return;
    try {
      await updateContact(contact._id, { status: newStatus });
      setContacts((prev) =>
        prev.map((item) => (item._id === contact._id ? { ...item, status: newStatus } : item))
      );
      fetchContacts();
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleUpdateContact = async () => {
    if (!selectedContact) return;
    setIsUpdating(true);
    setError(null);
    try {
      const response = await updateContact(selectedContact._id, {
        status: statusUpdate,
        replyMessage,
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to update contact');
      }
      if (response.data) {
        setContacts((prev) =>
          prev.map((item) => (item._id === selectedContact._id ? (response.data as Contact) : item))
        );
        setSelectedContact(response.data as Contact);
      }
      setDialogOpen(false);
      fetchContacts();
    } catch (err) {
      console.error('Failed to update contact:', err);
      setError(err instanceof Error ? err.message : 'Failed to update contact');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusSummary = useMemo(
    () => statusOptions.filter((option) => option.value !== 'all'),
    []
  );

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Inbox
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Contacts</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage website inquiries and follow ups in one unified queue.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <ExportButton type="contacts" />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusSummary.map((status) => (
          <Card
            key={status.value}
            className={`cursor-pointer transition-all border-white/70 bg-white/90 ${
              statusFilter === status.value ? 'ring-2 ring-primary' : 'hover:-translate-y-0.5'
            }`}
            onClick={() =>
              setStatusFilter(statusFilter === status.value ? 'all' : status.value)
            }
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <Badge className={statusClasses[status.value]}>
                  {status.label}
                </Badge>
                <span className="text-2xl font-semibold">
                  {statusCounts[status.value] || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/70 bg-white/90">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine the inbox list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, subject..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-[220px] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/90">
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>View and reply to customer messages</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No contacts found</div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Name & Subject</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell>
                        <p className="font-semibold">{contact.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {contact.subject}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col">
                          <span>{contact.email}</span>
                          <span className="text-muted-foreground">{contact.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusClasses[contact.status]}>{contact.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openContactDetails(contact)}>
                              View Details
                            </DropdownMenuItem>
                            {statusOptions
                              .filter((option) => option.value !== 'all' && option.value !== contact.status)
                              .map((option) => (
                                <DropdownMenuItem
                                  key={option.value}
                                  onClick={() => handleStatusChange(contact, option.value as Contact['status'])}
                                >
                                  Mark as {option.label}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing page {page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page === pagination.pages}
                    onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContact?.subject}</DialogTitle>
            <DialogDescription>
              Received on{' '}
              {selectedContact ? format(new Date(selectedContact.createdAt), 'PPP pp') : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <Label>Sender</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedContact.name}</span>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedContact.email}</span>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <Label>Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedContact.phone}</span>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <Label>Status</Label>
                  <Select value={statusUpdate} onValueChange={(value) => setStatusUpdate(value as Contact['status'])}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusSummary.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Message</Label>
                <Card className="mt-2 border-white/70 bg-white/90">
                  <CardContent className="pt-4 text-sm whitespace-pre-line">
                    {selectedContact.message}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label>Reply / Notes</Label>
                <Textarea
                  rows={4}
                  placeholder="Record your reply or response summary"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
                {selectedContact.repliedAt && (
                  <p className="text-xs text-muted-foreground">
                    Last replied {formatDistanceToNow(new Date(selectedContact.repliedAt), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateContact} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
