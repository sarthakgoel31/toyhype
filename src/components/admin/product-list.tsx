"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/order-utils";
import type { Product, Category } from "@/types/database";
import { Plus, Edit2, Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";

export function AdminProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) setCategories(await res.json());
    } catch {}
  }

  async function fetchProducts() {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch {}
    setLoading(false);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editProduct) return;

    const isNew = !editProduct.id;
    const url = isNew ? "/api/admin/products" : `/api/admin/products/${editProduct.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProduct),
      });

      if (res.ok) {
        toast.success(isNew ? "Product created" : "Product updated");
        setDialogOpen(false);
        setEditProduct(null);
        fetchProducts();
      } else {
        toast.error("Failed to save product");
      }
    } catch {
      toast.error("Error saving product");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (res.ok) {
        toast.success(isActive ? "Product hidden" : "Product visible");
        fetchProducts();
      }
    } catch {}
  }

  const newProduct = () => {
    setEditProduct({
      name: "",
      slug: "",
      description: "",
      price: 0,
      category_id: null,
      stock_quantity: 0,
      is_active: true,
      is_featured: false,
      images: [],
      specs: {},
    });
    setDialogOpen(true);
  };

  if (loading) return <p className="text-[var(--text-muted)]">Loading products...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[var(--text-muted)]">{products.length} products</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button size="sm" onClick={newProduct}>
              <Plus className="w-4 h-4 mr-1" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editProduct?.id ? "Edit Product" : "New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={saveProduct} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  required
                  value={editProduct?.name || ""}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  required
                  value={editProduct?.slug || ""}
                  onChange={(e) => setEditProduct({ ...editProduct, slug: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editProduct?.description || ""}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Category *</Label>
                <select
                  required
                  className="w-full mt-1 h-9 rounded-lg border border-[var(--border-subtle)] bg-white px-3 text-sm"
                  value={editProduct?.category_id || ""}
                  onChange={(e) => setEditProduct({ ...editProduct, category_id: e.target.value || null })}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (Rs)</Label>
                  <Input
                    type="number"
                    required
                    value={(editProduct?.price || 0) / 100}
                    onChange={(e) => setEditProduct({ ...editProduct, price: Math.round(Number(e.target.value) * 100) })}
                  />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    required
                    value={editProduct?.stock_quantity || 0}
                    onChange={(e) => setEditProduct({ ...editProduct, stock_quantity: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editProduct?.is_featured || false}
                    onChange={(e) => setEditProduct({ ...editProduct, is_featured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editProduct?.is_active !== false}
                    onChange={(e) => setEditProduct({ ...editProduct, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <Button type="submit" className="w-full">Save Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-3 bg-white rounded-xl border border-[var(--border-subtle)] p-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-xl shrink-0">
              🎮
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{product.name}</p>
                {product.is_featured && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span>{formatPrice(product.price)}</span>
                <span>&middot;</span>
                <span>{categories.find((c) => c.id === product.category_id)?.name || "No category"}</span>
                <span>&middot;</span>
                <span>{product.stock_quantity} in stock</span>
                {product.stock_quantity < 5 && (
                  <Badge variant="outline" className="text-[var(--accent-red)] border-[var(--accent-red)] text-xs">
                    Low
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => { setEditProduct(product); setDialogOpen(true); }}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => toggleActive(product.id, product.is_active)}
              >
                {product.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
