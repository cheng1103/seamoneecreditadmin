'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/lib/api';
import type { FAQ } from '@/types';

const categories = ['general', 'application', 'payment', 'requirements', 'fees'];

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderInputs, setOrderInputs] = useState<Record<string, string>>({});
  const [orderUpdatingId, setOrderUpdatingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    questionEn: '',
    questionMs: '',
    answerEn: '',
    answerMs: '',
    category: 'general',
    isActive: true,
    order: 1,
  });

  const activeCount = faqs.filter((faq) => faq.isActive).length;

  const getNextOrder = () =>
    faqs.length ? Math.max(...faqs.map((faq) => faq.order || 0)) + 1 : 1;

  const fetchFAQs = async () => {
    try {
      const response = await getFAQs();
      if (response.success && response.data) {
        const orderedFaqs = [...(response.data as FAQ[])].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setFaqs(orderedFaqs);
        const ordersMap = orderedFaqs.reduce<Record<string, string>>((acc, faq) => {
          acc[faq._id] = faq.order?.toString() ?? '0';
          return acc;
        }, {});
        setOrderInputs(ordersMap);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleOpenDialog = (faq?: FAQ) => {
    setFormError(null);
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        questionEn: faq.question.en,
        questionMs: faq.question.ms,
        answerEn: faq.answer.en,
        answerMs: faq.answer.ms,
        category: faq.category,
        isActive: faq.isActive,
        order: faq.order || 1,
      });
    } else {
      setEditingFaq(null);
      setFormData({
        questionEn: '',
        questionMs: '',
        answerEn: '',
        answerMs: '',
        category: 'general',
        isActive: true,
        order: getNextOrder(),
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);
    if (
      !formData.questionEn.trim() ||
      !formData.questionMs.trim() ||
      !formData.answerEn.trim() ||
      !formData.answerMs.trim()
    ) {
      setFormError('Please complete the question and answer in both languages.');
      return;
    }
    if (!formData.order || formData.order < 1) {
      setFormError('Display order must be a positive number.');
      return;
    }

    const data = {
      question: { en: formData.questionEn, ms: formData.questionMs },
      answer: { en: formData.answerEn, ms: formData.answerMs },
      category: formData.category,
      isActive: formData.isActive,
      order: formData.order,
    };

    try {
      if (editingFaq) {
        await updateFAQ(editingFaq._id, data);
      } else {
        await createFAQ(data);
      }
      setIsDialogOpen(false);
      fetchFAQs();
    } catch (error) {
      console.error('Failed to save FAQ:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await deleteFAQ(id);
      setFaqs(faqs.filter((f) => f._id !== id));
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
    }
  };

  const handleOrderSave = async (faq: FAQ) => {
    const targetValue = Number(orderInputs[faq._id]);
    if (!Number.isFinite(targetValue) || targetValue < 1) {
      setOrderInputs((prev) => ({
        ...prev,
        [faq._id]: (faq.order || 1).toString(),
      }));
      return;
    }

    setOrderUpdatingId(faq._id);
    try {
      await updateFAQ(faq._id, {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        isActive: faq.isActive,
        order: targetValue,
      });
      setOrderInputs((prev) => ({
        ...prev,
        [faq._id]: targetValue.toString(),
      }));
      setFaqs((prev) => {
        const updated = prev.map((item) =>
          item._id === faq._id ? { ...item, order: targetValue } : item
        );
        return [...updated].sort((a, b) => (a.order || 0) - (b.order || 0));
      });
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setOrderUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Knowledge base
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">FAQs</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Keep answers consistent across the site and support team.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isLoading ? (
                <Badge variant="outline" className="bg-white/80">
                  Loading insights...
                </Badge>
              ) : (
                <>
                  <Badge variant="outline" className="bg-white/80">
                    Total {faqs.length}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">Active {activeCount}</Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add FAQ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question (English)</Label>
                      <Input
                        value={formData.questionEn}
                        onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
                        placeholder="Enter question in English"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Question (Malay)</Label>
                      <Input
                        value={formData.questionMs}
                        onChange={(e) => setFormData({ ...formData, questionMs: e.target.value })}
                        placeholder="Masukkan soalan dalam Bahasa Melayu"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Answer (English)</Label>
                      <Textarea
                        value={formData.answerEn}
                        onChange={(e) => setFormData({ ...formData, answerEn: e.target.value })}
                        placeholder="Enter answer in English"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer (Malay)</Label>
                      <Textarea
                        value={formData.answerMs}
                        onChange={(e) => setFormData({ ...formData, answerMs: e.target.value })}
                        placeholder="Masukkan jawapan dalam Bahasa Melayu"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Checkbox
                          id="faq-is-active"
                          checked={formData.isActive}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, isActive: Boolean(checked) })
                          }
                        />
                        <Label htmlFor="faq-is-active" className="mt-0">
                          Active
                        </Label>
                      </div>
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

      <Card className="border-white/70 bg-white/90">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No FAQs yet</p>
              <Button onClick={() => handleOpenDialog()}>Create Your First FAQ</Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[200px]">Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq) => (
                  <TableRow key={faq._id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{faq.question.en}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {faq.answer.en}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{faq.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          className="w-20 h-9"
                          value={orderInputs[faq._id] ?? faq.order?.toString() ?? '1'}
                          onChange={(e) =>
                            setOrderInputs((prev) => ({
                              ...prev,
                              [faq._id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderSave(faq)}
                          disabled={orderUpdatingId === faq._id}
                        >
                          {orderUpdatingId === faq._id ? 'Saving' : 'Save'}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          faq.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDelete(faq._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
