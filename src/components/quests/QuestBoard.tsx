import React, { useState } from 'react';
import { useQuest } from '@/contexts/QuestContext';
import { Quest, QuestStatus, QuestPriority } from '@/types/quest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trophy, AlertCircle, Target, Eye, EyeOff } from 'lucide-react';
import { QuestCreator } from './QuestCreator';
import { QuestDetail } from './QuestDetail';
import { AnimatedList } from '@/components/ui/AnimatedList';
import { useCampaign } from '@/contexts/CampaignContext';
import { CrewVisibilityBadge } from '@/components/crew/CrewVisibilityBadge';

const statusColors: Record<QuestStatus, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/50',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  failed: 'bg-red-500/20 text-red-400 border-red-500/50',
  on_hold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
};

const priorityColors: Record<QuestPriority, string> = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
};

const categoryIcons = {
  main: '⭐',
  side: '📜',
  personal: '👤',
  faction: '🏛️',
};

export const QuestBoard: React.FC = () => {
  const { quests, isLoading, updateQuest } = useQuest();
  const { isGM } = useCampaign();
  const [showCreator, setShowCreator] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<QuestStatus | 'all'>('all');

  // Non-GMs never see hidden quests. GMs see them all, flagged with a badge.
  const visibleQuests = isGM ? quests : quests.filter(q => !q.is_hidden);

  const filteredQuests = filterStatus === 'all'
    ? visibleQuests
    : visibleQuests.filter(q => q.status === filterStatus);

  const activeCount = visibleQuests.filter(q => q.status === 'active').length;
  const completedCount = visibleQuests.filter(q => q.status === 'completed').length;
  const hiddenCount = isGM ? quests.filter(q => q.is_hidden).length : 0;

  const toggleHidden = async (e: React.MouseEvent, questId: string, currentHidden: boolean) => {
    e.stopPropagation();
    await updateQuest(questId, { is_hidden: !currentHidden });
  };

  if (selectedQuestId) {
    return <QuestDetail questId={selectedQuestId} onClose={() => setSelectedQuestId(null)} />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-terminal-primary">Quest Log</h2>
          <p className="text-terminal-primary/70 text-sm">
            Active: {activeCount} • Completed: {completedCount}
            {isGM && hiddenCount > 0 && ` • Hidden: ${hiddenCount}`}
          </p>
        </div>
        <Button
          onClick={() => setShowCreator(true)}
          className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Quest
        </Button>
      </div>

      {showCreator && (
        <QuestCreator onClose={() => setShowCreator(false)} />
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          onClick={() => setFilterStatus('all')}
          size="sm"
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          className={filterStatus === 'all'
            ? 'bg-terminal-primary/20 text-terminal-primary'
            : 'border-terminal-primary/30 text-terminal-primary/70'}
        >
          All ({visibleQuests.length})
        </Button>
        <Button
          onClick={() => setFilterStatus('active')}
          size="sm"
          variant={filterStatus === 'active' ? 'default' : 'outline'}
          className={filterStatus === 'active'
            ? 'bg-terminal-primary/20 text-terminal-primary'
            : 'border-terminal-primary/30 text-terminal-primary/70'}
        >
          Active ({activeCount})
        </Button>
        <Button
          onClick={() => setFilterStatus('completed')}
          size="sm"
          variant={filterStatus === 'completed' ? 'default' : 'outline'}
          className={filterStatus === 'completed'
            ? 'bg-terminal-primary/20 text-terminal-primary'
            : 'border-terminal-primary/30 text-terminal-primary/70'}
        >
          Completed ({completedCount})
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-terminal-primary/70">
            Loading quests...
          </div>
        ) : filteredQuests.length === 0 ? (
          <Card className="bg-black border-terminal-primary/30">
            <CardContent className="p-8 text-center text-terminal-primary/70">
              {filterStatus === 'all'
                ? 'No quests yet. Create your first quest to start tracking!'
                : `No ${filterStatus} quests.`}
            </CardContent>
          </Card>
        ) : (
          <AnimatedList className="space-y-3">
            {filteredQuests.map((quest) => (
              <Card
                key={quest.id}
                className="bg-black border-terminal-primary/30 hover:border-terminal-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedQuestId(quest.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{categoryIcons[quest.category]}</span>
                        <Badge className={statusColors[quest.status]}>
                          {quest.status}
                        </Badge>
                        <Badge className={priorityColors[quest.priority]}>
                          {quest.priority}
                        </Badge>
                        {isGM && quest.is_hidden && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                        {isGM && (
                          <CrewVisibilityBadge ids={quest.visible_crew_ids} />
                        )}
                      </div>
                      <CardTitle className="text-terminal-primary">{quest.title}</CardTitle>
                    </div>
                    {isGM && (
                      <Button
                        onClick={(e) => toggleHidden(e, quest.id, !!quest.is_hidden)}
                        variant="ghost"
                        size="sm"
                        title={quest.is_hidden ? 'Reveal to players' : 'Hide from players'}
                        className="text-terminal-primary/70 hover:bg-terminal-primary/20 hover:text-terminal-primary"
                      >
                        {quest.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {quest.description && (
                    <p className="text-terminal-primary/80 text-sm line-clamp-2 mb-3">
                      {quest.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-terminal-primary/70">
                    {quest.quest_giver && (
                      <div className="flex items-center gap-1">
                        <span>Quest Giver:</span>
                        <span className="text-terminal-primary">{quest.quest_giver}</span>
                      </div>
                    )}
                    {quest.location && (
                      <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span>{quest.location}</span>
                      </div>
                    )}
                  </div>
                  {(quest.reward_credits > 0 || quest.reward_xp > 0) && (
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {quest.reward_credits > 0 && (
                        <div className="flex items-center gap-1 text-terminal-primary">
                          <span>💰</span>
                          <span>{quest.reward_credits.toLocaleString()} Cr</span>
                        </div>
                      )}
                      {quest.reward_xp > 0 && (
                        <div className="flex items-center gap-1 text-terminal-primary">
                          <Trophy className="h-4 w-4" />
                          <span>{quest.reward_xp} XP</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </AnimatedList>
        )}
      </ScrollArea>
    </div>
  );
};
