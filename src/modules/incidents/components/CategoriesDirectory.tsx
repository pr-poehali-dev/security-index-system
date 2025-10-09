import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IncidentCategory, IncidentSubcategory } from '@/types';

export default function CategoriesDirectory() {
  const user = useAuthStore((state) => state.user);
  const { 
    getCategoriesByTenant, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    getSubcategoriesByTenant,
    getSubcategoriesByCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory
  } = useIncidentsStore();
  const { toast } = useToast();
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IncidentCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<IncidentSubcategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  const [categoryFormData, setCategoryFormData] = useState({ name: '', status: 'active' as const });
  const [subcategoryFormData, setSubcategoryFormData] = useState({ 
    categoryId: '', 
    name: '', 
    status: 'active' as const 
  });

  const categories = user?.tenantId ? getCategoriesByTenant(user.tenantId) : [];
  const subcategories = user?.tenantId ? getSubcategoriesByTenant(user.tenantId) : [];

  const handleCategorySubmit = () => {
    if (!categoryFormData.name.trim() || !user?.tenantId) {
      toast({ title: 'Ошибка', description: 'Заполните название', variant: 'destructive' });
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, { name: categoryFormData.name, status: categoryFormData.status });
      toast({ title: 'Категория обновлена' });
    } else {
      addCategory({ tenantId: user.tenantId, name: categoryFormData.name, status: categoryFormData.status });
      toast({ title: 'Категория добавлена' });
    }

    setCategoryFormData({ name: '', status: 'active' });
    setEditingCategory(null);
    setShowCategoryDialog(false);
  };

  const handleSubcategorySubmit = () => {
    if (!subcategoryFormData.name.trim() || !subcategoryFormData.categoryId || !user?.tenantId) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    if (editingSubcategory) {
      updateSubcategory(editingSubcategory.id, { 
        name: subcategoryFormData.name, 
        status: subcategoryFormData.status,
        categoryId: subcategoryFormData.categoryId
      });
      toast({ title: 'Подкатегория обновлена' });
    } else {
      addSubcategory({ 
        tenantId: user.tenantId, 
        categoryId: subcategoryFormData.categoryId,
        name: subcategoryFormData.name, 
        status: subcategoryFormData.status 
      });
      toast({ title: 'Подкатегория добавлена' });
    }

    setSubcategoryFormData({ categoryId: '', name: '', status: 'active' });
    setEditingSubcategory(null);
    setShowSubcategoryDialog(false);
  };

  const handleEditCategory = (category: IncidentCategory) => {
    setEditingCategory(category);
    setCategoryFormData({ name: category.name, status: category.status });
    setShowCategoryDialog(true);
  };

  const handleDeleteCategory = (id: string) => {
    const categorySubcategories = getSubcategoriesByCategory(id);
    if (categorySubcategories.length > 0) {
      toast({ 
        title: 'Ошибка', 
        description: 'Удалите сначала все подкатегории этой категории', 
        variant: 'destructive' 
      });
      return;
    }
    
    if (confirm('Удалить категорию?')) {
      deleteCategory(id);
      toast({ title: 'Категория удалена' });
    }
  };

  const handleEditSubcategory = (subcategory: IncidentSubcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({ 
      categoryId: subcategory.categoryId,
      name: subcategory.name, 
      status: subcategory.status 
    });
    setShowSubcategoryDialog(true);
  };

  const handleDeleteSubcategory = (id: string) => {
    if (confirm('Удалить подкатегорию?')) {
      deleteSubcategory(id);
      toast({ title: 'Подкатегория удалена' });
    }
  };

  const handleCloseCategoryDialog = () => {
    setShowCategoryDialog(false);
    setEditingCategory(null);
    setCategoryFormData({ name: '', status: 'active' });
  };

  const handleCloseSubcategoryDialog = () => {
    setShowSubcategoryDialog(false);
    setEditingSubcategory(null);
    setSubcategoryFormData({ categoryId: '', name: '', status: 'active' });
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '—';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Категории несоответствий</h3>
              <p className="text-sm text-muted-foreground">
                Основные категории для классификации инцидентов
              </p>
            </div>
            <Button onClick={() => setShowCategoryDialog(true)}>
              <Icon name="Plus" size={16} />
              Добавить категорию
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Подкатегорий</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => {
                    const categorySubcategories = getSubcategoriesByCategory(category.id);
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                            {category.status === 'active' ? 'Активна' : 'Неактивна'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {categorySubcategories.length}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                              <Icon name="Edit" size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Подкатегории несоответствий</h3>
              <p className="text-sm text-muted-foreground">
                Детализация категорий для точной классификации
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Фильтр по категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.filter(c => c.status === 'active').map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowSubcategoryDialog(true)}>
                <Icon name="Plus" size={16} />
                Добавить подкатегорию
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Категория</TableHead>
                  <TableHead>Название подкатегории</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories
                  .filter(sub => !selectedCategoryId || selectedCategoryId === 'all' || sub.categoryId === selectedCategoryId)
                  .length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  subcategories
                    .filter(sub => !selectedCategoryId || selectedCategoryId === 'all' || sub.categoryId === selectedCategoryId)
                    .map((subcategory) => (
                      <TableRow key={subcategory.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {getCategoryName(subcategory.categoryId)}
                        </TableCell>
                        <TableCell className="font-medium">{subcategory.name}</TableCell>
                        <TableCell>
                          <Badge variant={subcategory.status === 'active' ? 'default' : 'secondary'}>
                            {subcategory.status === 'active' ? 'Активна' : 'Неактивна'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditSubcategory(subcategory)}>
                              <Icon name="Edit" size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSubcategory(subcategory.id)}>
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCategoryDialog} onOpenChange={handleCloseCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</DialogTitle>
            <DialogDescription>
              Укажите название категории несоответствия
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Название</Label>
              <Input
                id="categoryName"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="Например: Категория 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryStatus">Статус</Label>
              <Select value={categoryFormData.status} onValueChange={(v) => setCategoryFormData({ ...categoryFormData, status: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активна</SelectItem>
                  <SelectItem value="inactive">Неактивна</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCategoryDialog}>
              Отмена
            </Button>
            <Button onClick={handleCategorySubmit}>
              {editingCategory ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubcategoryDialog} onOpenChange={handleCloseSubcategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubcategory ? 'Редактировать подкатегорию' : 'Добавить подкатегорию'}</DialogTitle>
            <DialogDescription>
              Укажите категорию и название подкатегории
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subcategoryCategoryId">Категория</Label>
              <Select value={subcategoryFormData.categoryId} onValueChange={(v) => setSubcategoryFormData({ ...subcategoryFormData, categoryId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.status === 'active').map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategoryName">Название подкатегории</Label>
              <Input
                id="subcategoryName"
                value={subcategoryFormData.name}
                onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                placeholder="Например: Подкатегория 1.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategoryStatus">Статус</Label>
              <Select value={subcategoryFormData.status} onValueChange={(v) => setSubcategoryFormData({ ...subcategoryFormData, status: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активна</SelectItem>
                  <SelectItem value="inactive">Неактивна</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseSubcategoryDialog}>
              Отмена
            </Button>
            <Button onClick={handleSubcategorySubmit}>
              {editingSubcategory ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
