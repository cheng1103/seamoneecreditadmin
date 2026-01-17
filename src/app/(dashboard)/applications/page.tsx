'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye } from 'lucide-react';
import { getApplications } from '@/lib/api';
import ExportButton from '@/components/ExportButton';
import type { Application } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  contacted: 'bg-indigo-100 text-indigo-800',
};

const loanTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'personal-loan', label: 'Personal Loan' },
  { value: 'business-loan', label: 'Business Loan' },
  { value: 'car-loan', label: 'Car Loan' },
  { value: 'home-loan', label: 'Home Loan' },
  { value: 'education-loan', label: 'Education Loan' },
];

const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [hideDuplicates, setHideDuplicates] = useState(true);

  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '-';
    }
    return `RM ${value.toLocaleString()}`;
  };

  const humanize = (value?: string) => {
    if (!value) return '';
    return value
      .split(/[\s-_]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: '20',
        dedupe: hideDuplicates ? 'true' : 'false',
      };
      if (appliedSearch) params.search = appliedSearch;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.loanType = typeFilter;

      const response = await getApplications(params);
      if (response.success) {
        setApplications(response.data as Application[]);
        if (response.pagination) {
          setPagination(response.pagination);
        }
        if (response.statusCounts) {
          setStatusCounts(response.statusCounts);
        }
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, appliedSearch, statusFilter, typeFilter, hideDuplicates]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Lead pipeline
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Applications</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track new submissions, follow-ups, and approvals in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExportButton type="applications" />
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['pending', 'processing', 'approved', 'rejected', 'cancelled'].map((status) => (
          <Card
            key={status}
            className={`cursor-pointer transition-all border-white/70 bg-white/90 ${
              statusFilter === status ? 'ring-2 ring-primary' : 'hover:-translate-y-0.5'
            }`}
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <Badge className={statusColors[status]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
                <span className="text-2xl font-bold">{statusCounts[status] || 0}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-white/70 bg-white/90">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, email, phone..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue placeholder="Loan Type" />
                </SelectTrigger>
                <SelectContent>
                  {loanTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground border rounded-lg px-3 py-1">
                <Checkbox
                  checked={hideDuplicates}
                  onCheckedChange={(value) => {
                    setHideDuplicates(Boolean(value));
                    setPage(1);
                  }}
                  id="hide-duplicates"
                />
                <span>Hide duplicate leads (phone/email/name match)</span>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No applications found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app._id}>
                      <TableCell className="font-mono text-sm">
                        {app.applicationId}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{app.fullName}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{app.phone}</p>
                        <p className="text-xs text-muted-foreground">{app.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {humanize(app.loanType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(app.loanAmount)}</TableCell>
                      <TableCell>
                        {typeof app.loanTerm === 'number' ? `${app.loanTerm} months` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[app.status] ?? 'bg-gray-100 text-gray-800'}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/applications/${app._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {applications.length} of {pagination.total} applications
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
