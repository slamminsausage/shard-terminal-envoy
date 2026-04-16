import React, { useState, useEffect } from 'react';
import { useQuest } from '@/contexts/QuestContext';
import { Quest, QuestObjective, QuestStatus, QuestPriority } from '@/types/quest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Check, X, Trash2, CheckCircle, XCircle, ChevronUp, ChevronDown, Pencil, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { useCampaign } from '@/contexts/CampaignContext';
import { CrewVisibilitySelector } from '@/components/crew/CrewVisibilitySelector';
import { CrewVisibilityBadge } from '@/components/crew/CrewVisibilityBadge';

interface QuestDetailProps {
  questId: string;
  onClose: () => void;
}

export const QuestDetail: React.FC<QuestDetailProps> = ({ questId, onClose }) => {
  const { isGM } = useCampaign();
  const {
    getQuest,
    updateQuest,
    completeQuest,
    failQuest,
    getQuestObjectives,
    addObjective,
    updateObjective,
    deleteObjective,
    completeObjective,
    reorderObjective
  } = useQuest();

  const [quest, setQuest] = useState<Quest | null>(null);
  const [objectives, setObjectives] = useState<QuestObjective[]>([]);
  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Objective form state
  const [objTitle, setObjTitle] = useState('');
  const [objDescription, setObjDescription] = useState('');
  const [objIsOptional, setObjIsOptional] = useState(false);
  const [objProgressRequired, setObjProgressRequired] = useState('1');

  // Details edit mode
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editQuestGiver, setEditQuestGiver] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editGmNotes, setEditGmNotes] = useState('');
  const [editIsHidden, setEditIsHidden] = useState(false);
  const [editVisibleCrewIds, setEditVisibleCrewIds] = useState<string[] | null>(null);

  // Rewards edit mode
  const [isEditingRewards, setIsEditingRewards] = useState(false);
  const [editRewardCredits, setEditRewardCredits] = useState('');
  const [editRewardXp, setEditRewardXp] = useState('');
  const [editRewardItems, setEditRewardItems] = useState('');
  const [editRewardOther, setEditRewardOther] = useState('');

  useEffect(() => {
    loadQuestData();
  }, [questId]);

  const loadQuestData = async () => {
    const questData = await getQuest(questId);
    if (!questData) {
      // Quest missing or filtered out by crew scope — bounce back to the
      // list and skip loading objectives so they don't leak either.
      onClose();
      return;
    }
    // Non-GMs should never land on a hidden quest detail page. If they
    // somehow reach this state (e.g. a quest was hidden after selection),
    // bounce them back to the quest list.
    if (questData.is_hidden && !isGM) {
      onClose();
      return;
    }
    setQuest(questData);

    const objectivesData = await getQuestObjectives(questId);
    setObjectives(objectivesData);
  };

  const handleAddObjective = async () => {
    if (!objTitle.trim()) return;

    await addObjective(questId, {
      title: objTitle,
      description: objDescription || undefined,
      order_index: objectives.length,
      status: 'pending',
      is_optional: objIsOptional,
      progress_current: 0,
      progress_required: parseInt(objProgressRequired, 10) || 1,
    });

    setObjTitle('');
    setObjDescription('');
    setObjIsOptional(false);
    setObjProgressRequired('1');
    setShowObjectiveForm(false);

    // Reload objectives
    const objectivesData = await getQuestObjectives(questId);
    setObjectives(objectivesData);
  };

  const handleCompleteObjective = async (objectiveId: string) => {
    await completeObjective(objectiveId);
    const objectivesData = await getQuestObjectives(questId);
    setObjectives(objectivesData);
  };

  const handleDeleteObjective = async (objectiveId: string) => {
    await deleteObjective(objectiveId);
    const objectivesData = await getQuestObjectives(questId);
    setObjectives(objectivesData);
  };

  const handleReorder = async (objectiveId: string, direction: 'up' | 'down') => {
    setIsReordering(true);
    try {
      await reorderObjective(questId, objectiveId, direction);
      const objectivesData = await getQuestObjectives(questId);
      setObjectives(objectivesData);
    } finally {
      setIsReordering(false);
    }
  };

  const handleStatusChange = async (newStatus: QuestStatus) => {
    if (!quest) return;

    if (newStatus === 'completed') {
      await completeQuest(questId);
    } else if (newStatus === 'failed') {
      await failQuest(questId);
    } else {
      await updateQuest(questId, { status: newStatus });
    }

    const questData = await getQuest(questId);
    if (questData) {
      setQuest(questData);
    }
  };

  const handlePriorityChange = async (newPriority: QuestPriority) => {
    if (!quest) return;
    await updateQuest(questId, { priority: newPriority });
    const questData = await getQuest(questId);
    if (questData) {
      setQuest(questData);
    }
  };

  // Details editing
  const startEditingDetails = () => {
    if (!quest) return;
    setEditTitle(quest.title || '');
    setEditDescription(quest.description || '');
    setEditQuestGiver(quest.quest_giver || '');
    setEditLocation(quest.location || '');
    setEditNotes(quest.notes || '');
    setEditGmNotes(quest.gm_notes || '');
    setEditIsHidden(!!quest.is_hidden);
    setEditVisibleCrewIds(quest.visible_crew_ids ?? null);
    setIsEditingDetails(true);
  };

  const saveDetails = async () => {
    if (!quest) return;
    const updated = await updateQuest(questId, {
      title: editTitle,
      description: editDescription,
      quest_giver: editQuestGiver,
      location: editLocation,
      notes: editNotes,
      gm_notes: editGmNotes,
      // Only GMs can change visibility; preserve existing value otherwise.
      ...(isGM ? { is_hidden: editIsHidden, visible_crew_ids: editVisibleCrewIds } : {}),
    });
    if (updated) {
      setQuest(updated);
    }
    setIsEditingDetails(false);
  };

  const toggleHidden = async () => {
    if (!quest || !isGM) return;
    const updated = await updateQuest(questId, { is_hidden: !quest.is_hidden });
    if (updated) setQuest(updated);
  };

  // Rewards editing
  const startEditingRewards = () => {
    if (!quest) return;
    setEditRewardCredits(String(quest.reward_credits || 0));
    setEditRewardXp(String(quest.reward_xp || 0));
    setEditRewardItems(quest.reward_items || '');
    setEditRewardOther(quest.reward_other || '');
    setIsEditingRewards(true);
  };

  const saveRewards = async () => {
    if (!quest) return;
    const updated = await updateQuest(questId, {
      reward_credits: parseInt(editRewardCredits, 10) || 0,
      reward_xp: parseInt(editRewardXp, 10) || 0,
      reward_items: editRewardItems,
      reward_other: editRewardOther,
    });
    if (updated) {
      setQuest(updated);
    }
    setIsEditingRewards(false);
  };

  if (!quest) {
    return (
      <div className="text-center py-8 text-terminal-primary/70">
        Loading quest...
      </div>
    );
  }

  const statusColors: Record<QuestStatus, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/50',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    failed: 'bg-red-500/20 text-red-400 border-red-500/50',
    on_hold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  };

  const priorityColors: Record<QuestPriority, string> = {
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    urgent: 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  const completedObjectives = objectives.filter(obj => obj.status === 'completed').length;
  const totalObjectives = objectives.length;
  const progressPercentage = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-terminal-primary hover:bg-terminal-primary/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-terminal-primary">{quest.title}</h2>
          <div className="flex gap-2 mt-1">
            <Badge className={statusColors[quest.status]}>
              {quest.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={priorityColors[quest.priority]}>
              {quest.priority.toUpperCase()}
            </Badge>
            {quest.category && (
              <Badge className="bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50">
                {quest.category.toUpperCase()}
              </Badge>
            )}
            {isGM && quest.is_hidden && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                <EyeOff className="h-3 w-3 mr-1" />
                HIDDEN FROM PLAYERS
              </Badge>
            )}
            {isGM && <CrewVisibilityBadge ids={quest.visible_crew_ids} />}
          </div>
        </div>

        <div className="flex gap-2">
          {isGM && (
            <Button
              onClick={toggleHidden}
              variant="outline"
              size="sm"
              title={quest.is_hidden ? 'Reveal to players' : 'Hide from players'}
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
            >
              {quest.is_hidden ? (
                <><Eye className="h-4 w-4 mr-1" />Reveal</>
              ) : (
                <><EyeOff className="h-4 w-4 mr-1" />Hide</>
              )}
            </Button>
          )}
          <Select value={quest.status} onValueChange={(v) => handleStatusChange(v as QuestStatus)}>
            <SelectTrigger className="w-[140px] bg-black border-terminal-primary/50 text-terminal-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-terminal-primary/50">
              <SelectItem value="active" className="text-terminal-primary">Active</SelectItem>
              <SelectItem value="on_hold" className="text-terminal-primary">On Hold</SelectItem>
              <SelectItem value="completed" className="text-terminal-primary">Completed</SelectItem>
              <SelectItem value="failed" className="text-terminal-primary">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={quest.priority} onValueChange={(v) => handlePriorityChange(v as QuestPriority)}>
            <SelectTrigger className="w-[120px] bg-black border-terminal-primary/50 text-terminal-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-terminal-primary/50">
              <SelectItem value="low" className="text-terminal-primary">Low</SelectItem>
              <SelectItem value="medium" className="text-terminal-primary">Medium</SelectItem>
              <SelectItem value="high" className="text-terminal-primary">High</SelectItem>
              <SelectItem value="urgent" className="text-terminal-primary">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="objectives" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-black border border-terminal-primary/30">
          <TabsTrigger value="objectives" className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary">
            Objectives ({completedObjectives}/{totalObjectives})
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary">
            Details
          </TabsTrigger>
          <TabsTrigger value="rewards" className="data-[state=active]:bg-terminal-primary/20 data-[state=active]:text-terminal-primary">
            Rewards
          </TabsTrigger>
        </TabsList>

        {/* ─── Objectives Tab ─── */}
        <TabsContent value="objectives" className="flex-1 mt-4">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-4 pr-4">
              {/* Progress Bar */}
              {totalObjectives > 0 && (
                <Card className="bg-black border-terminal-primary/50">
                  <CardContent className="pt-4">
                    <div className="flex justify-between text-sm text-terminal-primary/70 mb-2">
                      <span>Overall Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-terminal-primary/10 rounded-full h-2">
                      <div
                        className="bg-terminal-primary h-2 rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Objectives List */}
              {objectives.map((objective, index) => (
                <Card key={objective.id} className="bg-black border-terminal-primary/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Button
                        onClick={() => handleCompleteObjective(objective.id)}
                        disabled={objective.status === 'completed'}
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 w-6 mt-0.5 text-terminal-primary hover:bg-terminal-primary/20"
                      >
                        {objective.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <div className="h-5 w-5 rounded border-2 border-terminal-primary/50" />
                        )}
                      </Button>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className={`font-medium ${objective.status === 'completed' ? 'line-through text-terminal-primary/50' : 'text-terminal-primary'}`}>
                              {objective.title}
                              {objective.is_optional && (
                                <Badge className="ml-2 bg-terminal-primary/10 text-terminal-primary/70 border-terminal-primary/30">
                                  Optional
                                </Badge>
                              )}
                            </h4>
                            {objective.description && (
                              <p className="text-sm text-terminal-primary/70 mt-1">
                                {objective.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Reorder buttons */}
                            <div className="flex flex-col">
                              <Button
                                onClick={() => handleReorder(objective.id, 'up')}
                                disabled={index === 0 || isReordering}
                                variant="ghost"
                                size="sm"
                                className="p-0 h-5 w-5 text-terminal-primary/50 hover:bg-terminal-primary/20 hover:text-terminal-primary disabled:opacity-20"
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                onClick={() => handleReorder(objective.id, 'down')}
                                disabled={index === objectives.length - 1 || isReordering}
                                variant="ghost"
                                size="sm"
                                className="p-0 h-5 w-5 text-terminal-primary/50 hover:bg-terminal-primary/20 hover:text-terminal-primary disabled:opacity-20"
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            <Button
                              onClick={() => handleDeleteObjective(objective.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {objective.progress_required > 1 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-terminal-primary/70 mb-1">
                              <span>Progress</span>
                              <span>{objective.progress_current}/{objective.progress_required}</span>
                            </div>
                            <div className="w-full bg-terminal-primary/10 rounded-full h-1.5">
                              <div
                                className="bg-terminal-primary h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${(objective.progress_current / objective.progress_required) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Objective Form */}
              {showObjectiveForm ? (
                <Card className="bg-black border-terminal-primary/50">
                  <CardHeader>
                    <CardTitle className="text-terminal-primary text-sm">Add New Objective</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Input
                        placeholder="Objective title *"
                        value={objTitle}
                        onChange={(e) => setObjTitle(e.target.value)}
                        className="bg-black border-terminal-primary/50 text-terminal-primary"
                      />
                    </div>

                    <div>
                      <Textarea
                        placeholder="Description (optional)"
                        value={objDescription}
                        onChange={(e) => setObjDescription(e.target.value)}
                        rows={2}
                        className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-terminal-primary/70 mb-1 block">
                          Required Progress
                        </label>
                        <Input
                          type="number"
                          placeholder="1"
                          value={objProgressRequired}
                          onChange={(e) => setObjProgressRequired(e.target.value)}
                          className="bg-black border-terminal-primary/50 text-terminal-primary"
                        />
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm text-terminal-primary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={objIsOptional}
                            onChange={(e) => setObjIsOptional(e.target.checked)}
                            className="rounded border-terminal-primary/50"
                          />
                          Optional
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddObjective}
                        disabled={!objTitle.trim()}
                        size="sm"
                        className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        onClick={() => setShowObjectiveForm(false)}
                        variant="outline"
                        size="sm"
                        className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  onClick={() => setShowObjectiveForm(true)}
                  className="w-full bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Objective
                </Button>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ─── Details Tab ─── */}
        <TabsContent value="details" className="flex-1 mt-4">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-4 pr-4">
              <Card className="bg-black border-terminal-primary/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-terminal-primary text-sm">Quest Information</CardTitle>
                  {isEditingDetails ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={saveDetails}
                        size="sm"
                        className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={() => setIsEditingDetails(false)}
                        variant="outline"
                        size="sm"
                        className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={startEditingDetails}
                      variant="ghost"
                      size="sm"
                      className="text-terminal-primary/70 hover:bg-terminal-primary/20 hover:text-terminal-primary"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditingDetails ? (
                    <>
                      <div>
                        <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">Title</label>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-black border-terminal-primary/50 text-terminal-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">Description</label>
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                          className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">Quest Giver</label>
                        <Input
                          value={editQuestGiver}
                          onChange={(e) => setEditQuestGiver(e.target.value)}
                          className="bg-black border-terminal-primary/50 text-terminal-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">Location</label>
                        <Input
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="bg-black border-terminal-primary/50 text-terminal-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">Notes</label>
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={3}
                          placeholder="Player-visible notes..."
                          className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
                        />
                      </div>
                      {isGM && (
                        <div className="rounded border border-purple-500/40 bg-purple-500/5 p-3">
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editIsHidden}
                              onChange={(e) => setEditIsHidden(e.target.checked)}
                              className="mt-1 rounded border-purple-500/50"
                            />
                            <div>
                              <span className="text-sm text-purple-300 font-medium">
                                Hidden from players
                              </span>
                              <p className="text-xs text-purple-300/70 mt-0.5">
                                Players will not see this quest in their log while hidden.
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                      {isGM && (
                        <CrewVisibilitySelector
                          value={editVisibleCrewIds}
                          onChange={setEditVisibleCrewIds}
                        />
                      )}
                      {isGM && (
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">GM Notes</label>
                          <Textarea
                            value={editGmNotes}
                            onChange={(e) => setEditGmNotes(e.target.value)}
                            rows={3}
                            placeholder="GM-only notes..."
                            className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {quest.description && (
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                            Description
                          </label>
                          <p className="text-terminal-primary">{quest.description}</p>
                        </div>
                      )}

                      {quest.quest_giver && (
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                            Quest Giver
                          </label>
                          <p className="text-terminal-primary">{quest.quest_giver}</p>
                        </div>
                      )}

                      {quest.location && (
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                            Location
                          </label>
                          <p className="text-terminal-primary">{quest.location}</p>
                        </div>
                      )}

                      <div>
                        <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                          Date Accepted
                        </label>
                        <p className="text-terminal-primary">
                          {format(new Date(quest.date_accepted), 'MMM d, yyyy')}
                        </p>
                      </div>

                      {quest.date_completed && (
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                            Date Completed
                          </label>
                          <p className="text-terminal-primary">
                            {format(new Date(quest.date_completed), 'MMM d, yyyy')}
                          </p>
                        </div>
                      )}

                      {quest.notes && (
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                            Notes
                          </label>
                          <p className="text-terminal-primary whitespace-pre-wrap">{quest.notes}</p>
                        </div>
                      )}

                      {isGM && quest.gm_notes && (
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                            GM Notes
                          </label>
                          <p className="text-terminal-primary whitespace-pre-wrap">{quest.gm_notes}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ─── Rewards Tab ─── */}
        <TabsContent value="rewards" className="flex-1 mt-4">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-4 pr-4">
              <Card className="bg-black border-terminal-primary/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-terminal-primary text-sm">Quest Rewards</CardTitle>
                  {isEditingRewards ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={saveRewards}
                        size="sm"
                        className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={() => setIsEditingRewards(false)}
                        variant="outline"
                        size="sm"
                        className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={startEditingRewards}
                      variant="ghost"
                      size="sm"
                      className="text-terminal-primary/70 hover:bg-terminal-primary/20 hover:text-terminal-primary"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditingRewards ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">Credits</label>
                          <Input
                            type="number"
                            value={editRewardCredits}
                            onChange={(e) => setEditRewardCredits(e.target.value)}
                            className="bg-black border-terminal-primary/50 text-terminal-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">Experience Points</label>
                          <Input
                            type="number"
                            value={editRewardXp}
                            onChange={(e) => setEditRewardXp(e.target.value)}
                            className="bg-black border-terminal-primary/50 text-terminal-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">Items</label>
                        <Textarea
                          value={editRewardItems}
                          onChange={(e) => setEditRewardItems(e.target.value)}
                          rows={2}
                          placeholder="Item rewards..."
                          className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">Other Rewards</label>
                        <Textarea
                          value={editRewardOther}
                          onChange={(e) => setEditRewardOther(e.target.value)}
                          rows={2}
                          placeholder="Other rewards..."
                          className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                            Credits
                          </label>
                          <p className="text-xl font-bold text-terminal-primary">
                            {quest.reward_credits.toLocaleString()} Cr
                          </p>
                        </div>

                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                            Experience Points
                          </label>
                          <p className="text-xl font-bold text-terminal-primary">
                            {quest.reward_xp.toLocaleString()} XP
                          </p>
                        </div>
                      </div>

                      {quest.reward_items && (
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                            Items
                          </label>
                          <p className="text-terminal-primary">{quest.reward_items}</p>
                        </div>
                      )}

                      {quest.reward_other && (
                        <div>
                          <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                            Other Rewards
                          </label>
                          <p className="text-terminal-primary">{quest.reward_other}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {quest.status === 'completed' && (
                <Card className="bg-green-500/10 border-green-500/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Quest Completed!</span>
                    </div>
                    <p className="text-sm text-green-400/70 mt-1">
                      All rewards have been earned.
                    </p>
                  </CardContent>
                </Card>
              )}

              {quest.status === 'failed' && (
                <Card className="bg-red-500/10 border-red-500/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Quest Failed</span>
                    </div>
                    <p className="text-sm text-red-400/70 mt-1">
                      Rewards will not be earned.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
