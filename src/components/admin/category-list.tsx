"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Category } from "@/types/database";
import { Plus, Edit2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function AdminCategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCategory, setEditCategory] = useState<Partial<Category> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch {}
    setLoading(false);
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editCategory) return;

    const isNew = !editCategory.id;
    const url = isNew ? "/api/admin/categories" : `/api/admin/categories/${editCategory.id}`;
    const method = isNew ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCategory),
      });

      if (res.ok) {
        toast.success(isNew ? "Category created" : "Category updated");
        setDialogOpen(false);
        setEditCategory(null);
        fetchCategories();
      } else {
        toast.error("Failed to save category");
      }
    } catch {
      toast.error("Error saving category");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (res.ok) {
        toast.success(isActive ? "Category hidden" : "Category visible");
        fetchCategories();
      }
    } catch {}
  }

  if (loading) return <p className="text-[var(--text-muted)]">Loading categories...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[var(--text-muted)]">{categories.length} categories</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button
              size="sm"
              onClick={() => {
                setEditCategory({ name: "", slug: "", description: "", display_order: 0, is_active: true });
                setDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editCategory?.id ? "Edit Category" : "New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={saveCategory} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  required
                  value={editCategory?.name || ""}
                  onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  required
                  value={editCategory?.slug || ""}
                  onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={editCategory?.description || ""}
                  onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editCategory?.display_order || 0}
                  onChange={(e) => setEditCategory({ ...editCategory, display_order: Number(e.target.value) })}
                />
              </div>
              <Button type="submit" className="w-full">Save Category</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 bg-white rounded-xl border border-[var(--border-subtle)] p-3">
            <div className="flex-1">
              <p className="font-medium">{cat.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{cat.description}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => { setEditCategory(cat); setDialogOpen(true); }}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => toggleActive(cat.id, cat.is_active)}
              >
                {cat.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
