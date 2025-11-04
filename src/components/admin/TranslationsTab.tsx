import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Download, Upload, BarChart3, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Translation {
  id: string;
  key: string;
  value: string;
  language_code: string;
  category?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export function TranslationsTab() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("es");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(false);
  const [newTranslation, setNewTranslation] = useState<Omit<Translation, "id" | "created_at" | "updated_at">>({
    key: "",
    value: "",
    language_code: "es",
    category: "",
    description: ""
  });

  // Load translations from database
  const loadTranslations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', selectedLanguage)
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) {
        console.error('Error loading translations:', error);
        toast({
          title: "Error",
          description: "Error al cargar las traducciones",
          variant: "destructive",
        });
        return;
      }

      setTranslations(data || []);
      setFilteredTranslations(data || []);
    } catch (error) {
      console.error('Error loading translations:', error);
      toast({
        title: "Error",
        description: "Error al cargar las traducciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedLanguage]);

  // Load translations on component mount and language change
  useEffect(() => {
    loadTranslations();
  }, [selectedLanguage, loadTranslations]);

  // Filter translations based on search and category
  useEffect(() => {
    let filtered = translations;

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    setFilteredTranslations(filtered);
  }, [translations, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = Array.from(new Set(translations.map((t) => t.category).filter(Boolean)));

  // Get statistics
  const stats = {
    total: translations.length,
    categories: categories.length,
    recentlyUpdated: translations.filter((t) => {
      if (!t.updated_at) return false;
      const updatedDate = new Date(t.updated_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updatedDate > weekAgo;
    }).length,
  };

  const handleAddTranslation = async () => {
    if (!newTranslation.key || !newTranslation.value) {
      toast({
        title: "Error",
        description: "La clave y el valor son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('translations')
        .insert([{
          ...newTranslation,
          language_code: selectedLanguage
        }]);

      if (error) {
        console.error('Error adding translation:', error);
        toast({
          title: "Error",
          description: "Error al agregar la traducción",
          variant: "destructive",
        });
        return;
      }

      setNewTranslation({ 
        key: "", 
        value: "", 
        language_code: selectedLanguage,
        category: "", 
        description: "" 
      });
      setIsAddDialogOpen(false);
      await loadTranslations();
      
      toast({
        title: "Éxito",
        description: "Traducción agregada exitosamente",
      });
    } catch (error) {
      console.error('Error adding translation:', error);
      toast({
        title: "Error",
        description: "Error al agregar la traducción",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTranslation = async () => {
    if (!editingTranslation) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('translations')
        .update({
          key: editingTranslation.key,
          value: editingTranslation.value,
          category: editingTranslation.category,
          description: editingTranslation.description
        })
        .eq('id', editingTranslation.id);

      if (error) {
        console.error('Error updating translation:', error);
        toast({
          title: "Error",
          description: "Error al actualizar la traducción",
          variant: "destructive",
        });
        return;
      }

      setEditingTranslation(null);
      setIsEditDialogOpen(false);
      await loadTranslations();
      
      toast({
        title: "Éxito",
        description: "Traducción actualizada exitosamente",
      });
    } catch (error) {
      console.error('Error updating translation:', error);
      toast({
        title: "Error",
        description: "Error al actualizar la traducción",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTranslation = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting translation:', error);
        toast({
          title: "Error",
          description: "Error al eliminar la traducción",
          variant: "destructive",
        });
        return;
      }

      await loadTranslations();
      toast({
        title: "Éxito",
        description: "Traducción eliminada exitosamente",
      });
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la traducción",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportTranslations = () => {
    const exportData = translations.reduce((acc, t) => {
      acc[t.key] = t.value;
      return acc;
    }, {} as Record<string, string>);

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translations_${selectedLanguage}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Éxito",
      description: "Traducciones exportadas exitosamente",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Traducciones</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              En idioma {selectedLanguage.toUpperCase()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Badge variant="secondary">{stats.categories}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              Categorías diferentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actualizadas Recientemente</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentlyUpdated}</div>
            <p className="text-xs text-muted-foreground">
              Última semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar traducciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportTranslations} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={loadTranslations} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Traducción
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Nueva Traducción</DialogTitle>
                <DialogDescription>
                  Agrega una nueva traducción al sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="key" className="text-right">
                    Clave
                  </Label>
                  <Input
                    id="key"
                    value={newTranslation.key}
                    onChange={(e) => setNewTranslation({ ...newTranslation, key: e.target.value })}
                    className="col-span-3"
                    placeholder="ej: common.save"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    Valor
                  </Label>
                  <Input
                    id="value"
                    value={newTranslation.value}
                    onChange={(e) => setNewTranslation({ ...newTranslation, value: e.target.value })}
                    className="col-span-3"
                    placeholder="ej: Guardar"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoría
                  </Label>
                  <Input
                    id="category"
                    value={newTranslation.category}
                    onChange={(e) => setNewTranslation({ ...newTranslation, category: e.target.value })}
                    className="col-span-3"
                    placeholder="ej: common"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    value={newTranslation.description}
                    onChange={(e) => setNewTranslation({ ...newTranslation, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Descripción opcional..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddTranslation} disabled={loading}>
                  {loading ? "Agregando..." : "Agregar Traducción"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Traducciones ({filteredTranslations.length})</CardTitle>
          <CardDescription>
            Gestiona las traducciones del sistema para diferentes idiomas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Cargando traducciones...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clave</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Actualizado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTranslations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron traducciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTranslations.map((translation) => (
                    <TableRow key={translation.id}>
                      <TableCell className="font-mono text-sm">
                        {translation.key}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {translation.value}
                      </TableCell>
                      <TableCell>
                        {translation.category && (
                          <Badge variant="secondary">{translation.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {translation.description}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {translation.updated_at 
                          ? new Date(translation.updated_at).toLocaleDateString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTranslation(translation);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTranslation(translation.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Traducción</DialogTitle>
            <DialogDescription>
              Modifica la traducción seleccionada.
            </DialogDescription>
          </DialogHeader>
          {editingTranslation && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-key" className="text-right">
                  Clave
                </Label>
                <Input
                  id="edit-key"
                  value={editingTranslation.key}
                  onChange={(e) => setEditingTranslation({ ...editingTranslation, key: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-value" className="text-right">
                  Valor
                </Label>
                <Input
                  id="edit-value"
                  value={editingTranslation.value}
                  onChange={(e) => setEditingTranslation({ ...editingTranslation, value: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Categoría
                </Label>
                <Input
                  id="edit-category"
                  value={editingTranslation.category || ""}
                  onChange={(e) => setEditingTranslation({ ...editingTranslation, category: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingTranslation.description || ""}
                  onChange={(e) => setEditingTranslation({ ...editingTranslation, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditTranslation} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};