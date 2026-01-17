'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/api';
import type { Testimonial } from '@/types';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderInputs, setOrderInputs] = useState<Record<string, string>>({});
  const [orderUpdatingId, setOrderUpdatingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rating: 5,
    contentEn: '',
    contentMs: '',
    loanType: '',
    occupation: '',
    isActive: true,
    isFeatured: false,
    order: 1,
  });

  const activeCount = testimonials.filter((item) => item.isActive).length;
  const featuredCount = testimonials.filter((item) => item.isFeatured).length;

  const getNextOrder = () =>
    testimonials.length ? Math.max(...testimonials.map((item) => item.order || 0)) + 1 : 1;

  const fetchTestimonials = async () => {
    try {
      const response = await getTestimonials();
      if (response.success && response.data) {
        const orderedTestimonials = [...(response.data as Testimonial[])].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setTestimonials(orderedTestimonials);
        const mapped = orderedTestimonials.reduce<Record<string, string>>((acc, item) => {
          acc[item._id] = item.order?.toString() ?? '0';
          return acc;
        }, {});
        setOrderInputs(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenDialog = (item?: Testimonial) => {
    setFormError(null);
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        location: item.location || '',
        rating: item.rating,
        contentEn: item.content.en,
        contentMs: item.content.ms,
        loanType: item.loanType || '',
        occupation: item.occupation || '',
        isActive: item.isActive,
        isFeatured: item.isFeatured,
        order: item.order || 1,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        location: '',
        rating: 5,
        contentEn: '',
        contentMs: '',
        loanType: '',
        occupation: '',
        isActive: true,
        isFeatured: false,
        order: getNextOrder(),
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);
    if (!formData.name.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!formData.contentEn.trim() || !formData.contentMs.trim()) {
      setFormError('Please provide the review content in both languages.');
      return;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      setFormError('Rating must be between 1 and 5 stars.');
      return;
    }
    if (!formData.order || formData.order < 1) {
      setFormError('Display order must be a positive number.');
      return;
    }

    const data = {
      name: formData.name,
      location: formData.location,
      rating: formData.rating,
      content: { en: formData.contentEn, ms: formData.contentMs },
      loanType: formData.loanType,
      occupation: formData.occupation,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      order: formData.order,
    };

    try {
      if (editingItem) {
        await updateTestimonial(editingItem._id, data);
      } else {
        await createTestimonial(data);
      }
      setIsDialogOpen(false);
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await deleteTestimonial(id);
      setTestimonials(testimonials.filter((t) => t._id !== id));
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
    }
  };

  const handleOrderSave = async (item: Testimonial) => {
    const rawValue = orderInputs[item._id];
    const nextOrder = Number(rawValue);
    if (!Number.isFinite(nextOrder) || nextOrder < 1) {
      setOrderInputs((prev) => ({
        ...prev,
        [item._id]: (item.order || 1).toString(),
      }));
      return;
    }

    setOrderUpdatingId(item._id);
    try {
      await updateTestimonial(item._id, {
        name: item.name,
        location: item.location,
        rating: item.rating,
        content: item.content,
        loanType: item.loanType,
        occupation: item.occupation,
        isActive: item.isActive,
        isFeatured: item.isFeatured,
        order: nextOrder,
      });
      setOrderInputs((prev) => ({
        ...prev,
        [item._id]: nextOrder.toString(),
      }));
      setTestimonials((prev) => {
        const updated = prev.map((testimonial) =>
          testimonial._id === item._id ? { ...testimonial, order: nextOrder } : testimonial
        );
        return [...updated].sort((a, b) => (a.order || 0) - (b.order || 0));
      });
    } catch (error) {
      console.error('Failed to update testimonial order:', error);
    } finally {
      setOrderUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Social proof
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Testimonials</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Curate featured stories and keep reviews up to date.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isLoading ? (
                <Badge variant="outline" className="bg-white/80">
                  Loading insights...
                </Badge>
              ) : (
                <>
                  <Badge variant="outline" className="bg-white/80">
                    Total {testimonials.length}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">Active {activeCount}</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Featured {featuredCount}
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Testimonial
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Customer Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Ahmad bin Hassan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Kuala Lumpur"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Loan Type</Label>
                      <Input
                        value={formData.loanType}
                        onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                        placeholder="e.g., Personal Loan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Occupation</Label>
                      <Input
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="e.g., Engineer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= formData.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: Number(e.target.value) || 1 })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Review (English)</Label>
                      <Textarea
                        value={formData.contentEn}
                        onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                        placeholder="Customer review in English"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Review (Malay)</Label>
                      <Textarea
                        value={formData.contentMs}
                        onChange={(e) => setFormData({ ...formData, contentMs: e.target.value })}
                        placeholder="Ulasan pelanggan dalam Bahasa Melayu"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isActive: checked as boolean })
                        }
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isFeatured: checked as boolean })
                        }
                      />
                      <Label htmlFor="isFeatured">Featured on Homepage</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <Card className="border-white/70 bg-white/90">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No testimonials yet</p>
            <Button onClick={() => handleOpenDialog()}>Add Your First Testimonial</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((item) => (
            <Card key={item._id} className="relative overflow-hidden border-white/70 bg-white/90">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-300" />
              <CardContent className="pt-6">
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Badges */}
                <div className="flex gap-2 mb-4">
                  {item.isFeatured && (
                    <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                  )}
                  <Badge variant="outline">Order #{item.order || '-'}</Badge>
                  <Badge
                    className={
                      item.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  &ldquo;{item.content.en}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {item.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.location} {item.loanType && `• ${item.loanType}`}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label className="text-xs text-muted-foreground">Adjust Order</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      className="h-9 w-24"
                      value={orderInputs[item._id] ?? item.order?.toString() ?? '1'}
                      onChange={(e) =>
                        setOrderInputs((prev) => ({
                          ...prev,
                          [item._id]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOrderSave(item)}
                      disabled={orderUpdatingId === item._id}
                    >
                      {orderUpdatingId === item._id ? 'Saving' : 'Save'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
