'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { getBlogs, deleteBlog } from '@/lib/api';
import type { Blog } from '@/types';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const publishedCount = blogs.filter((blog) => blog.status === 'published').length;
  const draftCount = blogs.filter((blog) => blog.status === 'draft').length;

  const fetchBlogs = async () => {
    try {
      const response = await getBlogs();
      if (response.success && response.data) {
        setBlogs(response.data as Blog[]);
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      await deleteBlog(id);
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch (error) {
      console.error('Failed to delete blog:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Content studio
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Blog Posts</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Plan, publish, and monitor content performance in one view.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isLoading ? (
                <Badge variant="outline" className="bg-white/80">
                  Loading insights...
                </Badge>
              ) : (
                <>
                  <Badge variant="outline" className="bg-white/80">
                    Total {blogs.length}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">Published {publishedCount}</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">Drafts {draftCount}</Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/content/blogs/new">
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/90">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No blog posts yet</p>
              <Button asChild>
                <Link href="/content/blogs/new">Create Your First Post</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{blog.title.en}</p>
                        <p className="text-xs text-muted-foreground">{blog.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{blog.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          blog.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {blog.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{blog.views}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {blog.publishedAt
                        ? format(new Date(blog.publishedAt), 'PP')
                        : format(new Date(blog.createdAt), 'PP')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/content/blogs/${blog._id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(blog._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
