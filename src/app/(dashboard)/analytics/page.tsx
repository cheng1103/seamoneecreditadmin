'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, Users, FileText, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getAnalyticsOverview, getVisitorStats, getConversionStats } from '@/lib/api';

interface AnalyticsOverview {
  applications: {
    total: number;
    pending: number;
    approved: number;
    today: number;
    thisMonth: number;
  };
  visitors: {
    total: number;
    today: number;
    thisMonth: number;
  };
  pageViews: {
    total: number;
    today: number;
    thisMonth: number;
  };
}

interface VisitorStat {
  date: string;
  visitors: number;
  pageViews: number;
}

interface ConversionStat {
  date: string;
  applications: number;
  approved: number;
  conversionRate: number;
}

const visitorChartConfig: ChartConfig = {
  visitors: { label: 'Visitors', color: '#3b82f6' },
  pageViews: { label: 'Page Views', color: '#10b981' },
};

const conversionChartConfig: ChartConfig = {
  applications: { label: 'Applications', color: '#6366f1' },
  approved: { label: 'Approved', color: '#22c55e' },
  conversionRate: { label: 'Conversion Rate (%)', color: '#f97316' },
};

const periodOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [visitorStats, setVisitorStats] = useState<VisitorStat[]>([]);
  const [conversionStats, setConversionStats] = useState<ConversionStat[]>([]);
  const [period, setPeriod] = useState('30d');
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [visitorLoading, setVisitorLoading] = useState(true);
  const [conversionLoading, setConversionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setOverviewLoading(true);
      try {
        const response = await getAnalyticsOverview();
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load overview');
        }
        setOverview(response.data as AnalyticsOverview);
      } catch (err) {
        console.error('Failed to load overview analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics overview');
      } finally {
        setOverviewLoading(false);
      }
    };

    fetchOverview();
  }, []);

  useEffect(() => {
    const fetchVisitorData = async () => {
      setVisitorLoading(true);
      try {
        const response = await getVisitorStats(period);
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load visitor stats');
        }
        setVisitorStats(response.data as VisitorStat[]);
      } catch (err) {
        console.error('Failed to load visitor stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load visitor stats');
      } finally {
        setVisitorLoading(false);
      }
    };

    const fetchConversionData = async () => {
      setConversionLoading(true);
      try {
        const response = await getConversionStats(period);
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load conversion stats');
        }
        setConversionStats(
          (response.data as ConversionStat[]).map((item) => ({
            ...item,
            conversionRate: Number(item.conversionRate),
          }))
        );
      } catch (err) {
        console.error('Failed to load conversion stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load conversion stats');
      } finally {
        setConversionLoading(false);
      }
    };

    fetchVisitorData();
    fetchConversionData();
  }, [period]);

  const visitorChartData = useMemo(
    () =>
      visitorStats.map((item) => ({
        date: format(new Date(item.date), 'MMM d'),
        visitors: item.visitors,
        pageViews: item.pageViews,
      })),
    [visitorStats]
  );

  const conversionChartData = useMemo(
    () =>
      conversionStats.map((item) => ({
        date: format(new Date(item.date), 'MMM d'),
        applications: item.applications,
        approved: item.approved,
        conversionRate: item.conversionRate,
      })),
    [conversionStats]
  );

  const summaryCards = [
    {
      title: 'Total Applications',
      value: overview?.applications.total?.toLocaleString() || '0',
      change: `+${overview?.applications.thisMonth ?? 0} this month`,
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      helper: 'Lifetime total',
      loading: overviewLoading,
    },
    {
      title: 'Pending Applications',
      value: overview?.applications.pending?.toLocaleString() || '0',
      change: `${overview?.applications.today ?? 0} new today`,
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      helper: 'Awaiting review',
      loading: overviewLoading,
    },
    {
      title: 'Visitors (30d)',
      value: overview?.visitors.thisMonth?.toLocaleString() || '0',
      change: `${overview?.visitors.today ?? 0} today`,
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      helper: 'Unique visitors',
      loading: overviewLoading,
    },
    {
      title: 'Page Views (30d)',
      value: overview?.pageViews.thisMonth?.toLocaleString() || '0',
      change: `${overview?.pageViews.today ?? 0} today`,
      trend: 'up',
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      helper: 'All pages combined',
      loading: overviewLoading,
    },
  ];

  const applicationSnapshot = [
    {
      label: 'Approved',
      count: overview?.applications.approved || 0,
      color: 'bg-green-500',
    },
    {
      label: 'Pending',
      count: overview?.applications.pending || 0,
      color: 'bg-yellow-500',
    },
    {
      label: 'Today',
      count: overview?.applications.today || 0,
      color: 'bg-blue-500',
    },
    {
      label: 'This Month',
      count: overview?.applications.thisMonth || 0,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Insights
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Analytics</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track visitor flow, applications, and conversion momentum.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden border-white/70 bg-white/90">
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/5" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {card.loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {card.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    )}
                    <span className={card.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {card.change}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{card.helper}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visitor Trends */}
        <Card className="border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>Visitor Trends</CardTitle>
            <CardDescription>Unique visitors vs overall page views</CardDescription>
          </CardHeader>
          <CardContent>
            {visitorLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer config={visitorChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visitorChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#3b82f6"
                      fill="rgba(59, 130, 246, 0.2)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      stroke="#10b981"
                      fill="rgba(16, 185, 129, 0.2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Conversion Performance */}
        <Card className="border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>Conversion Performance</CardTitle>
            <CardDescription>Applications vs approvals and conversion rate</CardDescription>
          </CardHeader>
          <CardContent>
            {conversionLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ChartContainer config={conversionChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conversionChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="applications"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="approved"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversionRate"
                      stroke="#f97316"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="border-white/70 bg-white/90">
        <CardHeader>
          <CardTitle>Application Status Breakdown</CardTitle>
          <CardDescription>Current status of all applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {applicationSnapshot.map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-lg bg-muted/50 text-center"
              >
                {overviewLoading ? (
                  <Skeleton className="h-10 w-16 mx-auto" />
                ) : (
                  <>
                    <p className="text-3xl font-bold">{item.count}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </>
                )}
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{
                      width: overview?.applications.total
                        ? `${Math.min(
                            100,
                            Math.round((item.count / overview.applications.total) * 100)
                          )}%`
                        : '0%',
                    }}
                  />
                </div>
                {!overviewLoading && overview?.applications.total && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {((item.count / overview.applications.total) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
