'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, DollarSign, Percent, Calendar } from 'lucide-react';
import { getProducts, updateProduct } from '@/lib/api';
import type { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    minAmount: 0,
    maxAmount: 0,
    minRate: 0,
    maxRate: 0,
    minTenure: 0,
    maxTenure: 0,
    isActive: true,
    isFeatured: false,
  });

  const activeCount = products.filter((product) => product.isActive).length;
  const featuredCount = products.filter((product) => product.isFeatured).length;

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      if (response.success && response.data) {
        setProducts(response.data as Product[]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      minAmount: product.loanAmount.min,
      maxAmount: product.loanAmount.max,
      minRate: product.interestRate.min,
      maxRate: product.interestRate.max,
      minTenure: product.tenure.min,
      maxTenure: product.tenure.max,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    const data = {
      loanAmount: { min: formData.minAmount, max: formData.maxAmount },
      interestRate: {
        min: formData.minRate,
        max: formData.maxRate,
        type: editingProduct.interestRate.type,
      },
      tenure: { min: formData.minTenure, max: formData.maxTenure },
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
    };

    try {
      await updateProduct(editingProduct._id, data);
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-white/70 bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-transparent" />
        <CardContent className="relative flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Product catalog
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Loan Products</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Maintain pricing, availability, and featured offerings.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isLoading ? (
                <Badge variant="outline" className="bg-white/80">
                  Loading insights...
                </Badge>
              ) : (
                <>
                  <Badge variant="outline" className="bg-white/80">
                    Total {products.length}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">Active {activeCount}</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Featured {featuredCount}
                  </Badge>
                </>
              )}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Update loan ranges and eligibility in seconds.
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="relative overflow-hidden border-white/70 bg-white/90">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-200 via-emerald-300 to-teal-300" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{product.name.en}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.name.ms}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                    )}
                    <Badge
                      className={
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Loan Amount</p>
                      <p className="font-medium">
                        RM {product.loanAmount.min.toLocaleString()} -{' '}
                        {product.loanAmount.max.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">
                        {product.interestRate.min}% - {product.interestRate.max}% p.a.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Tenure</p>
                      <p className="font-medium">
                        {product.tenure.min} - {product.tenure.max} months
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-white"
                  onClick={() => handleEdit(product)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {editingProduct?.name.en}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Loan Amount (RM)</Label>
                <Input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Loan Amount (RM)</Label>
                <Input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minRate}
                  onChange={(e) => setFormData({ ...formData, minRate: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.maxRate}
                  onChange={(e) => setFormData({ ...formData, maxRate: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Tenure (months)</Label>
                <Input
                  type="number"
                  value={formData.minTenure}
                  onChange={(e) => setFormData({ ...formData, minTenure: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Tenure (months)</Label>
                <Input
                  type="number"
                  value={formData.maxTenure}
                  onChange={(e) => setFormData({ ...formData, maxTenure: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="productActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <Label htmlFor="productActive">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="productFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked as boolean })
                  }
                />
                <Label htmlFor="productFeatured">Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
