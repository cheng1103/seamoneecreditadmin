'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { createBlog, updateBlog, deleteBlog } from '@/lib/api';
import type { Blog } from '@/types';

const categoryOptions = [
  { value: 'tips', label: 'Tips' },
  { value: 'news', label: 'News' },
  { value: 'guides', label: 'Guides' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'updates', label: 'Updates' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const blogSchema = z.object({
  titleEn: z.string().min(3, 'Title (EN) is required'),
  titleMs: z.string().min(3, 'Title (MS) is required'),
  slug: z.string().min(3, 'Slug is required'),
  excerptEn: z.string().min(10, 'Excerpt (EN) is required'),
  excerptMs: z.string().min(10, 'Excerpt (MS) is required'),
  contentEn: z.string().min(20, 'Content (EN) is required'),
  contentMs: z.string().min(20, 'Content (MS) is required'),
  category: z.string().min(2, 'Category is required'),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.string().optional(),
  featuredImageUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  featuredImageAltEn: z.string().optional(),
  featuredImageAltMs: z.string().optional(),
  seoTitleEn: z.string().optional(),
  seoTitleMs: z.string().optional(),
  seoDescriptionEn: z.string().optional(),
  seoDescriptionMs: z.string().optional(),
  seoKeywords: z.string().optional(),
});

export type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogFormProps {
  blog?: Blog;
}

export default function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const defaultValues: BlogFormValues = useMemo(
    () => ({
      titleEn: blog?.title.en || '',
      titleMs: blog?.title.ms || '',
      slug: blog?.slug || '',
      excerptEn: blog?.excerpt?.en || '',
      excerptMs: blog?.excerpt?.ms || '',
      contentEn: blog?.content.en || '',
      contentMs: blog?.content.ms || '',
      category: blog?.category || 'tips',
      status: (blog?.status as BlogFormValues['status']) || 'draft',
      tags: blog?.tags?.join(', ') || '',
      featuredImageUrl: blog?.featuredImage?.url || '',
      featuredImageAltEn: blog?.featuredImage?.alt?.en || '',
      featuredImageAltMs: blog?.featuredImage?.alt?.ms || '',
      seoTitleEn: blog?.seo?.title?.en || '',
      seoTitleMs: blog?.seo?.title?.ms || '',
      seoDescriptionEn: blog?.seo?.description?.en || '',
      seoDescriptionMs: blog?.seo?.description?.ms || '',
      seoKeywords: blog?.seo?.keywords?.join(', ') || '',
    }),
    [blog]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues,
  });

  useEffect(() => {
    setValue('titleEn', defaultValues.titleEn);
    setValue('titleMs', defaultValues.titleMs);
    setValue('slug', defaultValues.slug);
    setValue('excerptEn', defaultValues.excerptEn);
    setValue('excerptMs', defaultValues.excerptMs);
    setValue('contentEn', defaultValues.contentEn);
    setValue('contentMs', defaultValues.contentMs);
    setValue('category', defaultValues.category);
    setValue('status', defaultValues.status);
    setValue('tags', defaultValues.tags || '');
    setValue('featuredImageUrl', defaultValues.featuredImageUrl || '');
    setValue('featuredImageAltEn', defaultValues.featuredImageAltEn || '');
    setValue('featuredImageAltMs', defaultValues.featuredImageAltMs || '');
    setValue('seoTitleEn', defaultValues.seoTitleEn || '');
    setValue('seoTitleMs', defaultValues.seoTitleMs || '');
    setValue('seoDescriptionEn', defaultValues.seoDescriptionEn || '');
    setValue('seoDescriptionMs', defaultValues.seoDescriptionMs || '');
    setValue('seoKeywords', defaultValues.seoKeywords || '');
  }, [defaultValues, setValue]);

  const onSubmit = async (values: BlogFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    const payload = {
      title: { en: values.titleEn, ms: values.titleMs },
      slug: values.slug,
      excerpt: { en: values.excerptEn, ms: values.excerptMs },
      content: { en: values.contentEn, ms: values.contentMs },
      category: values.category,
      status: values.status,
      tags: values.tags ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      featuredImage: values.featuredImageUrl
        ? {
            url: values.featuredImageUrl,
            alt: {
              en: values.featuredImageAltEn || values.titleEn,
              ms: values.featuredImageAltMs || values.titleMs,
            },
          }
        : undefined,
      seo: {
        title: {
          en: values.seoTitleEn,
          ms: values.seoTitleMs,
        },
        description: {
          en: values.seoDescriptionEn,
          ms: values.seoDescriptionMs,
        },
        keywords: values.seoKeywords
          ? values.seoKeywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
          : [],
      },
    };

    try {
      if (blog?._id) {
        await updateBlog(blog._id, payload);
      } else {
        await createBlog(payload);
      }
      router.push('/content/blogs');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!blog?._id) return;
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    setIsDeleting(true);
    setFormError(null);
    try {
      await deleteBlog(blog._id);
      router.push('/content/blogs');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to delete blog post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Card className="border-white/70 bg-white/90">
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>English & Bahasa Malaysia versions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title (EN)</Label>
              <Input placeholder="Enter English title" {...register('titleEn')} />
              {errors.titleEn && <p className="text-sm text-red-500">{errors.titleEn.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Title (MS)</Label>
              <Input placeholder="Masukkan tajuk BM" {...register('titleMs')} />
              {errors.titleMs && <p className="text-sm text-red-500">{errors.titleMs.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Excerpt (EN)</Label>
              <Textarea rows={3} placeholder="Short intro" {...register('excerptEn')} />
              {errors.excerptEn && <p className="text-sm text-red-500">{errors.excerptEn.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Excerpt (MS)</Label>
              <Textarea rows={3} placeholder="Ringkasan" {...register('excerptMs')} />
              {errors.excerptMs && <p className="text-sm text-red-500">{errors.excerptMs.message}</p>}
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Content (EN)</Label>
              <Textarea rows={10} placeholder="HTML or markdown content" {...register('contentEn')} />
              {errors.contentEn && <p className="text-sm text-red-500">{errors.contentEn.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Content (MS)</Label>
              <Textarea rows={10} placeholder="Kandungan BM" {...register('contentMs')} />
              {errors.contentMs && <p className="text-sm text-red-500">{errors.contentMs.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/90">
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>Manage slug, category, status and tags</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input placeholder="unique-slug" {...register('slug')} />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={defaultValues.category} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={defaultValues.status} onValueChange={(value) => setValue('status', value as BlogFormValues['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input placeholder="loan, finance, malaysia" {...register('tags')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/90">
        <CardHeader>
          <CardTitle>Featured Image & SEO</CardTitle>
          <CardDescription>Optional assets and metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input placeholder="https://..." {...register('featuredImageUrl')} />
              {errors.featuredImageUrl && <p className="text-sm text-red-500">{errors.featuredImageUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Image Alt (EN)</Label>
              <Input placeholder="Alt text EN" {...register('featuredImageAltEn')} />
            </div>
            <div className="space-y-2">
              <Label>Image Alt (MS)</Label>
              <Input placeholder="Alt text MS" {...register('featuredImageAltMs')} />
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>SEO Title (EN)</Label>
              <Input {...register('seoTitleEn')} />
            </div>
            <div className="space-y-2">
              <Label>SEO Title (MS)</Label>
              <Input {...register('seoTitleMs')} />
            </div>
            <div className="space-y-2">
              <Label>SEO Description (EN)</Label>
              <Textarea rows={3} {...register('seoDescriptionEn')} />
            </div>
            <div className="space-y-2">
              <Label>SEO Description (MS)</Label>
              <Textarea rows={3} {...register('seoDescriptionMs')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>SEO Keywords (comma separated)</Label>
              <Input {...register('seoKeywords')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting || (!isDirty && !blog)}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {blog ? 'Update Post' : 'Publish Post'}
            </>
          )}
        </Button>
        {blog && (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
