import Link from 'next/link';
import BlogForm from '@/components/content/BlogForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Content studio
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Create blog post</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Draft, translate, and optimize your next article.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="bg-white">
              <Link href="/content/blogs">Back to posts</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <BlogForm />
    </div>
  );
}
