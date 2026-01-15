import React, { useState, useEffect } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Package } from 'lucide-react';

interface ItemCreatorProps {
  ownerId: string;
  ownerType: 'character' | 'vehicle' | 'storage';
  onClose: () => void;
}

export const ItemCreator: React.FC<ItemCreatorProps> = ({
  ownerId,
  ownerType,
  onClose,
}) => {
  const { createItem, templates, getAllTemplates } = useInventory();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState('equipment');
  const [quantity, setQuantity] = useState('1');
  const [weightKg, setWeightKg] = useState('0');
  const [volumeM3, setVolumeM3] = useState('0');
  const [valueCredits, setValueCredits] = useState('0');
  const [techLevel, setTechLevel] = useState('');
  const [location, setLocation] = useState('carried');
  const [condition, setCondition] = useState<'excellent' | 'good' | 'worn' | 'damaged' | 'broken'>('good');
  const [notes, setNotes] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    getAllTemplates();
  }, [getAllTemplates]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setItemType(template.item_type || 'equipment');
      setWeightKg(template.weight_kg.toString());
      setVolumeM3(template.volume_m3.toString());
      setValueCredits(template.value_credits.toString());
      setTechLevel(template.tech_level?.toString() || '');
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      return;
    }

    await createItem({
      owner_id: ownerId,
      owner_type: ownerType,
      name,
      description: description || undefined,
      item_type: itemType,
      quantity: parseInt(quantity) || 1,
      weight_kg: parseFloat(weightKg) || 0,
      volume_m3: parseFloat(volumeM3) || 0,
      value_credits: parseInt(valueCredits) || 0,
      tech_level: techLevel ? parseInt(techLevel) : undefined,
      location,
      condition,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <Card className="bg-black border-terminal-primary/50 mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-terminal-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Item to Inventory
          </CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-terminal-primary hover:bg-terminal-primary/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selector */}
        {templates.length > 0 && (
          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Quick Add from Template (Optional)
            </label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id} className="text-terminal-primary">
                    {template.name} ({template.value_credits} Cr, {template.weight_kg} kg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Item Name *
            </label>
            <Input
              placeholder="Item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Description
            </label>
            <Textarea
              placeholder="Item description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Type
            </label>
            <Select value={itemType} onValueChange={setItemType}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                <SelectItem value="weapon" className="text-terminal-primary">Weapon</SelectItem>
                <SelectItem value="armor" className="text-terminal-primary">Armor</SelectItem>
                <SelectItem value="equipment" className="text-terminal-primary">Equipment</SelectItem>
                <SelectItem value="trade_good" className="text-terminal-primary">Trade Good</SelectItem>
                <SelectItem value="consumable" className="text-terminal-primary">Consumable</SelectItem>
                <SelectItem value="currency" className="text-terminal-primary">Currency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Quantity
            </label>
            <Input
              type="number"
              min="1"
              placeholder="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>
        </div>

        {/* Physical Properties */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Weight (kg)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Volume (m³)
            </label>
            <Input
              type="number"
              step="0.001"
              placeholder="0"
              value={volumeM3}
              onChange={(e) => setVolumeM3(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Tech Level
            </label>
            <Input
              type="number"
              min="0"
              max="20"
              placeholder="Optional"
              value={techLevel}
              onChange={(e) => setTechLevel(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>
        </div>

        {/* Financial */}
        <div>
          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
            Value (Credits)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={valueCredits}
            onChange={(e) => setValueCredits(e.target.value)}
            className="bg-black border-terminal-primary/50 text-terminal-primary"
          />
        </div>

        {/* Location & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Location
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                <SelectItem value="worn" className="text-terminal-primary">Worn</SelectItem>
                <SelectItem value="carried" className="text-terminal-primary">Carried</SelectItem>
                <SelectItem value="stowed" className="text-terminal-primary">Stowed</SelectItem>
                <SelectItem value="cargo_hold" className="text-terminal-primary">Cargo Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Condition
            </label>
            <Select value={condition} onValueChange={(v: any) => setCondition(v)}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                <SelectItem value="excellent" className="text-terminal-primary">Excellent</SelectItem>
                <SelectItem value="good" className="text-terminal-primary">Good</SelectItem>
                <SelectItem value="worn" className="text-terminal-primary">Worn</SelectItem>
                <SelectItem value="damaged" className="text-terminal-primary">Damaged</SelectItem>
                <SelectItem value="broken" className="text-terminal-primary">Broken</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
            Notes
          </label>
          <Textarea
            placeholder="Additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
          >
            <Save className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
