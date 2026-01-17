'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye } from 'lucide-react';
import type { Application } from '@/types';

interface Props {
  applications: Application[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  contacted: 'bg-indigo-100 text-indigo-800',
};

const loanTypeLabels: Record<string, string> = {
  'personal-loan': 'Personal',
  'business-loan': 'Business',
  'car-loan': 'Car',
  'education-loan': 'Education',
  'home-loan': 'Home',
};

export default function RecentApplicationsTable({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No applications yet
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-muted/40">
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Applicant</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app._id}>
            <TableCell className="font-mono text-sm">{app.applicationId}</TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{app.fullName}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{app.email}</p>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {loanTypeLabels[app.loanType] || app.loanType}
              </Badge>
            </TableCell>
            <TableCell>
              {typeof app.loanAmount === 'number'
                ? `RM ${app.loanAmount.toLocaleString()}`
                : '—'}
            </TableCell>
            <TableCell>
              <Badge className={statusColors[app.status]}>
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
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
  );
}
