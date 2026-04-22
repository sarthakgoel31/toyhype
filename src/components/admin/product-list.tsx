"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/order-utils";
import type { Product, Category } from "@/types/database";
import { Plus, Edit2, Eye, EyeOff, Star, Upload, X, Crown } from "lucide-react";
import { toast } from "sonner";

export function AdminProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url as string;
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        urls.push(url);
      }

      const currentImages = editProduct?.images || [];
      setEditProduct({
        ...editProduct,
        images: [...currentImages, ...urls],
      });
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
    } catch {
      toast.error("Failed to upload images");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    const images = [...(editProduct?.images || [])];
    images.splice(index, 1);
    setEditProduct({ ...editProduct, images });
  }

  function setHeroImage(index: number) {
    const images = [...(editProduct?.images || [])];
    const [hero] = images.splice(index, 1);
    images.unshift(hero);
    setEditProduct({ ...editProduct, images });
    toast.success("Hero image set");
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
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
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

              {/* Image Upload */}
              <div>
                <Label>Product Images</Label>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-2">First image is the hero. Click the crown to change hero.</p>

                {/* Image grid */}
                {(editProduct?.images?.length ?? 0) > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {editProduct?.images?.map((url, i) => (
                      <div key={i} className={`relative aspect-square rounded-lg overflow-hidden border-2 ${i === 0 ? "border-[var(--accent-blue)]" : "border-transparent"}`}>
                        <Image
                          src={url}
                          alt={`Product image ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                        {i === 0 && (
                          <div className="absolute top-1 left-1 bg-[var(--accent-blue)] text-white rounded-full p-0.5">
                            <Crown className="w-3 h-3" />
                          </div>
                        )}
                        <div className="absolute top-1 right-1 flex gap-1">
                          {i !== 0 && (
                            <button
                              type="button"
                              onClick={() => setHeroImage(i)}
                              className="bg-white/90 rounded-full p-1 hover:bg-white"
                              title="Set as hero image"
                            >
                              <Crown className="w-3 h-3 text-[var(--accent-blue)]" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="bg-white/90 rounded-full p-1 hover:bg-white"
                          >
                            <X className="w-3 h-3 text-[var(--accent-red)]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Images"}
                </Button>
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
                  <Label>Compare Price (Rs)</Label>
                  <Input
                    type="number"
                    placeholder="Original price"
                    value={(editProduct?.compare_at_price || 0) / 100 || ""}
                    onChange={(e) => setEditProduct({ ...editProduct, compare_at_price: e.target.value ? Math.round(Number(e.target.value) * 100) : null })}
                  />
                </div>
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  required
                  value={editProduct?.stock_quantity || 0}
                  onChange={(e) => setEditProduct({ ...editProduct, stock_quantity: Number(e.target.value) })}
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editProduct?.is_featured || false}
                    onChange={(e) => setEditProduct({ ...editProduct, is_featured: e.target.checked })}
                  />
                  Featured on homepage
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
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
              {product.images?.[0] ? (
                <Image src={product.images[0]} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-xl">
                  🎮
                </div>
              )}
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
                <span>&middot;</span>
                <span>{product.images?.length || 0} imgs</span>
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
