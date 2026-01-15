import React, { useState, useEffect } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { InventoryItem } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Package, Trash2, ArrowRightLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface InventoryListProps {
  ownerId?: string;
  ownerType?: 'character' | 'vehicle' | 'storage';
  showActions?: boolean;
  onTransferItem?: (item: InventoryItem) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  ownerId,
  ownerType,
  showActions = true,
  onTransferItem,
}) => {
  const { items, getAllItems, deleteItem, isLoading } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  useEffect(() => {
    getAllItems(ownerId, ownerType);
  }, [ownerId, ownerType, getAllItems]);

  const filteredItems = items.filter(item => {
    // Search filter
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = filterType === 'all' || item.item_type === filterType;

    // Location filter
    const matchesLocation = filterLocation === 'all' || item.location === filterLocation;

    return matchesSearch && matchesType && matchesLocation;
  });

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(itemId);
    }
  };

  const getTotalValue = () => {
    return filteredItems.reduce((sum, item) => sum + (item.value_credits * item.quantity), 0);
  };

  const getTotalWeight = () => {
    return filteredItems.reduce((sum, item) => sum + (item.weight_kg * item.quantity), 0);
  };

  const conditionColors = {
    excellent: 'bg-green-500/20 text-green-400 border-green-500/50',
    good: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    worn: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    damaged: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    broken: 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-terminal-primary">Inventory</h2>
          <div className="flex gap-4 text-sm text-terminal-primary/70">
            <span>{filteredItems.length} items</span>
            <span>•</span>
            <span>{getTotalWeight().toFixed(2)} kg</span>
            <span>•</span>
            <span>{getTotalValue().toLocaleString()} Cr</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-terminal-primary/50" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-black border-terminal-primary/50 text-terminal-primary"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-black border-terminal-primary/50">
            <SelectItem value="all" className="text-terminal-primary">All Types</SelectItem>
            <SelectItem value="weapon" className="text-terminal-primary">Weapons</SelectItem>
            <SelectItem value="armor" className="text-terminal-primary">Armor</SelectItem>
            <SelectItem value="equipment" className="text-terminal-primary">Equipment</SelectItem>
            <SelectItem value="trade_good" className="text-terminal-primary">Trade Goods</SelectItem>
            <SelectItem value="consumable" className="text-terminal-primary">Consumables</SelectItem>
            <SelectItem value="currency" className="text-terminal-primary">Currency</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent className="bg-black border-terminal-primary/50">
            <SelectItem value="all" className="text-terminal-primary">All Locations</SelectItem>
            <SelectItem value="worn" className="text-terminal-primary">Worn</SelectItem>
            <SelectItem value="carried" className="text-terminal-primary">Carried</SelectItem>
            <SelectItem value="stowed" className="text-terminal-primary">Stowed</SelectItem>
            <SelectItem value="cargo_hold" className="text-terminal-primary">Cargo Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-terminal-primary/70">
            Loading inventory...
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="bg-black border-terminal-primary/30">
            <CardContent className="p-8 text-center text-terminal-primary/70">
              {searchQuery || filterType !== 'all' || filterLocation !== 'all'
                ? 'No items match your filters.'
                : 'No items in inventory. Add items to get started.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="bg-black border-terminal-primary/30 hover:border-terminal-primary/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-terminal-primary/70" />
                        <h3 className="font-bold text-terminal-primary">{item.name}</h3>
                        {item.quantity > 1 && (
                          <Badge className="bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50">
                            x{item.quantity}
                          </Badge>
                        )}
                        {item.item_type && (
                          <Badge className="bg-terminal-primary/10 text-terminal-primary/70 border-terminal-primary/30">
                            {item.item_type}
                          </Badge>
                        )}
                        <Badge className={conditionColors[item.condition]}>
                          {item.condition}
                        </Badge>
                      </div>

                      {item.description && (
                        <p className="text-sm text-terminal-primary/80 mb-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-terminal-primary/70">
                        <div className="flex items-center gap-1">
                          <span className="font-mono">⚖️</span>
                          <span>{(item.weight_kg * item.quantity).toFixed(2)} kg</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="font-mono">💰</span>
                          <span>{(item.value_credits * item.quantity).toLocaleString()} Cr</span>
                        </div>

                        {item.tech_level && (
                          <div className="flex items-center gap-1">
                            <span className="font-mono">🔧</span>
                            <span>TL {item.tech_level}</span>
                          </div>
                        )}

                        {item.location && (
                          <div className="flex items-center gap-1">
                            <span className="font-mono">📍</span>
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-terminal-primary/60 mt-2 italic">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    {showActions && (
                      <div className="flex gap-1">
                        {onTransferItem && (
                          <Button
                            onClick={() => onTransferItem(item)}
                            variant="ghost"
                            size="sm"
                            className="text-terminal-primary hover:bg-terminal-primary/20"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
