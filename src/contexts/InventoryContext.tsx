import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { InventoryItem, ItemTemplate } from '@/types/inventory';
import { dbHelpers } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface InventoryContextType {
  // Inventory items
  items: InventoryItem[];
  isLoading: boolean;

  // Item CRUD
  getAllItems: (ownerId?: string, ownerType?: string) => Promise<void>;
  getItem: (itemId: string) => Promise<InventoryItem | null>;
  createItem: (itemData: Partial<InventoryItem>) => Promise<InventoryItem | null>;
  updateItem: (itemId: string, updates: Partial<InventoryItem>) => Promise<InventoryItem | null>;
  deleteItem: (itemId: string) => Promise<boolean>;
  transferItem: (itemId: string, newOwnerId: string, newOwnerType: string) => Promise<InventoryItem | null>;

  // Templates
  templates: ItemTemplate[];
  getAllTemplates: () => Promise<void>;
  createTemplate: (templateData: Partial<ItemTemplate>) => Promise<ItemTemplate | null>;
  deleteTemplate: (templateId: string) => Promise<boolean>;

  // Utilities
  calculateEncumbrance: (ownerId: string, strengthScore: number) => {
    totalWeight: number;
    weightLimit: number;
    isEncumbered: boolean;
    encumbranceLevel: 'none' | 'light' | 'heavy' | 'overloaded';
    penalty: number;
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [templates, setTemplates] = useState<ItemTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getAllItems = useCallback(async (ownerId?: string, ownerType?: string) => {
    setIsLoading(true);
    try {
      const data = await dbHelpers.getAllInventoryItems(ownerId, ownerType);
      setItems(data as InventoryItem[]);
    } catch (error) {
      console.error('Failed to load inventory items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getItem = useCallback(async (itemId: string): Promise<InventoryItem | null> => {
    try {
      const data = await dbHelpers.getInventoryItem(itemId);
      return data as InventoryItem;
    } catch (error) {
      console.error('Failed to load inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory item',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const createItem = useCallback(async (itemData: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    try {
      const newItem = {
        player_id: 'campaign',
        quantity: 1,
        weight_kg: 0,
        volume_m3: 0,
        value_credits: 0,
        condition: 'good' as const,
        ...itemData,
      };

      const data = await dbHelpers.saveInventoryItem(newItem);

      if (data) {
        setItems(prev => [data as InventoryItem, ...prev]);
        toast({
          title: 'Success',
          description: 'Item added to inventory',
        });
        return data as InventoryItem;
      }
      return null;
    } catch (error) {
      console.error('Failed to create inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to create inventory item',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const updateItem = useCallback(async (itemId: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    try {
      const data = await dbHelpers.saveInventoryItem({ id: itemId, ...updates });

      if (data) {
        setItems(prev => prev.map(item => item.id === itemId ? data as InventoryItem : item));
        toast({
          title: 'Success',
          description: 'Item updated',
        });
        return data as InventoryItem;
      }
      return null;
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inventory item',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const deleteItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      await dbHelpers.deleteInventoryItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: 'Success',
        description: 'Item deleted',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete inventory item',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const transferItem = useCallback(async (itemId: string, newOwnerId: string, newOwnerType: string): Promise<InventoryItem | null> => {
    try {
      const data = await dbHelpers.transferInventoryItem(itemId, newOwnerId, newOwnerType);

      if (data) {
        setItems(prev => prev.map(item => item.id === itemId ? data as InventoryItem : item));
        toast({
          title: 'Success',
          description: 'Item transferred',
        });
        return data as InventoryItem;
      }
      return null;
    } catch (error) {
      console.error('Failed to transfer inventory item:', error);
      toast({
        title: 'Error',
        description: 'Failed to transfer inventory item',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const getAllTemplates = useCallback(async () => {
    try {
      const data = await dbHelpers.getAllItemTemplates();
      setTemplates(data as ItemTemplate[]);
    } catch (error) {
      console.error('Failed to load item templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load item templates',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const createTemplate = useCallback(async (templateData: Partial<ItemTemplate>): Promise<ItemTemplate | null> => {
    try {
      const newTemplate = {
        player_id: 'campaign',
        weight_kg: 0,
        volume_m3: 0,
        value_credits: 0,
        is_system_template: false,
        ...templateData,
      };

      const data = await dbHelpers.saveItemTemplate(newTemplate);

      if (data) {
        setTemplates(prev => [...prev, data as ItemTemplate]);
        toast({
          title: 'Success',
          description: 'Template created',
        });
        return data as ItemTemplate;
      }
      return null;
    } catch (error) {
      console.error('Failed to create item template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create item template',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const deleteTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    try {
      await dbHelpers.deleteItemTemplate(templateId);
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      toast({
        title: 'Success',
        description: 'Template deleted',
      });
      return true;
    } catch (error) {
      console.error('Failed to delete item template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item template',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const calculateEncumbrance = useCallback((ownerId: string, strengthScore: number) => {
    const ownerItems = items.filter(item => item.owner_id === ownerId);
    const totalWeight = ownerItems.reduce((sum, item) => sum + (item.weight_kg * item.quantity), 0);

    // Traveller encumbrance: STR x 2 = light, STR x 4 = heavy, STR x 6 = overloaded
    const lightLimit = strengthScore * 2;
    const heavyLimit = strengthScore * 4;
    const overloadLimit = strengthScore * 6;

    let encumbranceLevel: 'none' | 'light' | 'heavy' | 'overloaded' = 'none';
    let penalty = 0;

    if (totalWeight > overloadLimit) {
      encumbranceLevel = 'overloaded';
      penalty = -3;
    } else if (totalWeight > heavyLimit) {
      encumbranceLevel = 'heavy';
      penalty = -2;
    } else if (totalWeight > lightLimit) {
      encumbranceLevel = 'light';
      penalty = -1;
    }

    return {
      totalWeight,
      weightLimit: overloadLimit,
      isEncumbered: penalty < 0,
      encumbranceLevel,
      penalty,
    };
  }, [items]);

  const value: InventoryContextType = {
    items,
    isLoading,
    getAllItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    transferItem,
    templates,
    getAllTemplates,
    createTemplate,
    deleteTemplate,
    calculateEncumbrance,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
