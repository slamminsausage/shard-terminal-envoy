import React, { useState } from 'react';
import { useTrade } from '@/contexts/TradeContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, Save, Package, Plus } from 'lucide-react';
import { TRADE_GOODS, TradeGoodType } from '@/data/tradeGoods';

interface AddCargoDialogProps {
  vehicleId?: string;
  onClose: () => void;
}

export const AddCargoDialog: React.FC<AddCargoDialogProps> = ({
  vehicleId,
  onClose,
}) => {
  const { purchaseTradeGood } = useTrade();
  const { vehicles } = useCampaign();

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [name, setName] = useState('');
  const [tradeCode, setTradeCode] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [tons, setTons] = useState('1');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseWorld, setPurchaseWorld] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleId || '');
  const [isSpeculation, setIsSpeculation] = useState(false);
  const [brokerSkill, setBrokerSkill] = useState('0');
  const [notes, setNotes] = useState('');

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = TRADE_GOODS.find(t => t.id === templateId);
    if (template) {
      setName(template.name);
      setTradeCode(template.id);
      setBasePrice(template.basePrice.toString());
      setPurchasePrice(template.basePrice.toString());
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !purchasePrice) {
      return;
    }

    const parsedTons = parseFloat(tons) || 1;
    const parsedPrice = parseInt(purchasePrice) || 0;

    await purchaseTradeGood({
      name: name.trim(),
      trade_code: tradeCode || 'misc',
      base_price: parseInt(basePrice) || parsedPrice,
      tons: parsedTons,
      purchase_price: parsedPrice,
      purchase_world: purchaseWorld || undefined,
      purchase_date: new Date().toISOString(),
      vehicle_id: selectedVehicle || undefined,
      is_speculation: isSpeculation,
      broker_skill_used: parseInt(brokerSkill) || 0,
      notes: notes || undefined,
    });

    onClose();
  };

  // Calculate price per ton for display
  const pricePerTon = purchasePrice && tons
    ? Math.round(parseInt(purchasePrice) / parseFloat(tons))
    : 0;

  return (
    <Card className="bg-black border-terminal-primary/50 mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-terminal-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add Cargo to Hold
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
        <div>
          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
            Quick Select Trade Good (Optional)
          </label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
              <SelectValue placeholder="Select a trade good type..." />
            </SelectTrigger>
            <SelectContent className="bg-black border-terminal-primary/50 max-h-[300px]">
              {TRADE_GOODS.map(good => (
                <SelectItem key={good.id} value={good.id} className="text-terminal-primary">
                  <span className="flex items-center gap-2">
                    {good.name}
                    <span className="text-terminal-primary/50">
                      ({good.basePrice.toLocaleString()} Cr/ton)
                    </span>
                    {good.illegal && (
                      <span className="text-red-400 text-xs">ILLEGAL</span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Cargo Name *
            </label>
            <Input
              placeholder="e.g., Industrial Parts, Processed Foods"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Quantity (Tons) *
            </label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="1"
              value={tons}
              onChange={(e) => setTons(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Total Purchase Price (Cr) *
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
            {pricePerTon > 0 && (
              <div className="text-xs text-terminal-primary/50 mt-1">
                {pricePerTon.toLocaleString()} Cr per ton
              </div>
            )}
          </div>
        </div>

        {/* Purchase Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Purchase World/Station
            </label>
            <Input
              placeholder="e.g., Regina, Efate Highport"
              value={purchaseWorld}
              onChange={(e) => setPurchaseWorld(e.target.value)}
              className="bg-black border-terminal-primary/50 text-terminal-primary"
            />
          </div>

          <div>
            <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
              Store on Vehicle
            </label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                <SelectValue placeholder="None (General Cargo)" />
              </SelectTrigger>
              <SelectContent className="bg-black border-terminal-primary/50">
                <SelectItem value="" className="text-terminal-primary">
                  None (General Cargo)
                </SelectItem>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id} className="text-terminal-primary">
                    {vehicle.name} ({vehicle.cargo_capacity} tons capacity)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Speculation Options */}
        <div className="border border-terminal-primary/30 rounded p-3 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="speculation"
              checked={isSpeculation}
              onCheckedChange={(checked) => setIsSpeculation(checked === true)}
              className="border-terminal-primary/50 data-[state=checked]:bg-terminal-primary data-[state=checked]:text-black"
            />
            <Label
              htmlFor="speculation"
              className="text-sm text-terminal-primary cursor-pointer"
            >
              Speculation Trade (using Broker skill)
            </Label>
          </div>

          {isSpeculation && (
            <div>
              <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                Broker Skill Level Used
              </label>
              <Select value={brokerSkill} onValueChange={setBrokerSkill}>
                <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-terminal-primary/50">
                  {[0, 1, 2, 3, 4, 5, 6].map(level => (
                    <SelectItem key={level} value={level.toString()} className="text-terminal-primary">
                      {level === 0 ? 'None (0)' : `Level ${level} (+${level})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
            Notes
          </label>
          <Textarea
            placeholder="Additional notes about this cargo..."
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
            disabled={!name.trim() || !purchasePrice}
            className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Cargo
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
