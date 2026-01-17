'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import BlogForm from '@/components/content/BlogForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getBlog } from '@/lib/api';
import type { Blog } from '@/types';

export default function EditBlogPage() {
  const params = useParams();
  const blogId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!blogId) return;
    const fetchBlog = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getBlog(blogId);
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to load blog post');
        }
        setBlog(response.data as Blog);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Content studio
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">
              {blog ? blog.title.en : 'Edit blog post'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review SEO, update content, and publish when ready.
            </p>
            {blog && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-white/80">
                  {blog.category}
                </Badge>
                <Badge
                  className={
                    blog.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {blog.status}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="bg-white">
              <Link href="/content/blogs">Back to posts</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      ) : blog ? (
        <BlogForm blog={blog} />
      ) : (
        <Card className="border-white/70 bg-white/90">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Blog post not found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
