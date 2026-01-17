'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Clock,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { getApplicationStats, getApplications } from '@/lib/api';
import type { DashboardStats, Application } from '@/types';
import RecentApplicationsTable from '@/components/dashboard/RecentApplicationsTable';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appsRes] = await Promise.all([
          getApplicationStats(),
          getApplications({ limit: '5', sortBy: 'createdAt', sortOrder: 'desc' }),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data as DashboardStats);
        }
        if (appsRes.success && appsRes.data) {
          setRecentApplications(appsRes.data as Application[]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.total || 0,
      icon: FileText,
      description: 'All time',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending Review',
      value: stats?.pending || 0,
      icon: Clock,
      description: 'Needs attention',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'This Month',
      value: stats?.thisMonth || 0,
      icon: CalendarDays,
      description: `${stats?.growth || 0}% vs last month`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: Number(stats?.growth) >= 0 ? 'up' : 'down',
    },
    {
      title: 'Today',
      value: stats?.today || 0,
      icon: TrendingUp,
      description: 'New applications',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Overview
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track daily volume, review queues, and conversion momentum.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="bg-white">
              <Link href="/applications">View applications</Link>
            </Button>
            <Button asChild>
              <Link href="/analytics">Open analytics</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-white/70 bg-white/90">
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/5" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {stat.trend && (
                      stat.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )
                    )}
                    {stat.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card className="border-white/70 bg-white/90">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <RecentApplicationsTable applications={recentApplications} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
