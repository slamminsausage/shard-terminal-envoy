import React, { useState } from 'react';
import { useCalendar } from '@/contexts/CalendarContext';
import { CalendarEvent } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Plus,
  ChevronRight,
  Clock,
  MapPin,
  Save,
  X,
  CheckCircle,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useCampaign } from '@/contexts/CampaignContext';
import { CrewVisibilitySelector } from '@/components/crew/CrewVisibilitySelector';
import { CrewVisibilityBadge } from '@/components/crew/CrewVisibilityBadge';

export const CalendarView: React.FC = () => {
  const {
    currentDate,
    advanceTime,
    upcomingEvents,
    createEvent,
    completeEvent,
    deleteEvent,
    isLoading
  } = useCalendar();

  const { isGM } = useCampaign();
  const [showEventForm, setShowEventForm] = useState(false);
  const [advanceDays, setAdvanceDays] = useState('1');

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState<'event' | 'deadline' | 'reminder' | 'travel'>('event');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventIsRecurring, setEventIsRecurring] = useState(false);
  const [eventRecurrenceDays, setEventRecurrenceDays] = useState('7');
  const [eventVisibleCrewIds, setEventVisibleCrewIds] = useState<string[] | null>(null);

  const handleAdvanceTime = async () => {
    const days = parseInt(advanceDays, 10) || 1;
    if (days > 0) {
      await advanceTime(days);
    }
  };

  const imperialDateValid = /^\d{3}-\d{4}$/.test(eventDate.trim());

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventDate.trim() || !imperialDateValid) {
      return;
    }

    await createEvent({
      title: eventTitle,
      description: eventDescription || undefined,
      event_type: eventType,
      imperial_date: eventDate,
      location: eventLocation || undefined,
      is_recurring: eventIsRecurring,
      recurrence_interval: eventIsRecurring ? parseInt(eventRecurrenceDays, 10) || 7 : undefined,
      is_completed: false,
      ...(isGM ? { visible_crew_ids: eventVisibleCrewIds } : {}),
    });

    // Reset form
    setEventTitle('');
    setEventDescription('');
    setEventType('event');
    setEventDate('');
    setEventLocation('');
    setEventIsRecurring(false);
    setEventRecurrenceDays('7');
    setEventVisibleCrewIds(null);
    setShowEventForm(false);
  };

  const handleCompleteEvent = async (eventId: string) => {
    await completeEvent(eventId);
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  const eventTypeColors = {
    event: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    deadline: 'bg-red-500/20 text-red-400 border-red-500/50',
    reminder: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    travel: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  };

  const eventTypeIcons = {
    event: '📅',
    deadline: '⏰',
    reminder: '🔔',
    travel: '🚀',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Current Date Display */}
      <Card className="bg-black border-terminal-primary/50 mb-4">
        <CardHeader>
          <CardTitle className="text-terminal-primary flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Current Campaign Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-terminal-primary/70">Loading...</div>
          ) : currentDate ? (
            <div>
              <div className="text-3xl font-bold text-terminal-primary mb-4">
                {currentDate.formatted}
              </div>
              <div className="text-terminal-primary/70 text-sm mb-4">
                Day {currentDate.day} of {currentDate.year}
              </div>

              {/* Time Advancement Controls */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-terminal-primary/70 uppercase mb-1 block">
                    Advance Time
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Days"
                    value={advanceDays}
                    onChange={(e) => setAdvanceDays(e.target.value)}
                    className="bg-black border-terminal-primary/50 text-terminal-primary"
                  />
                </div>
                <Button
                  onClick={handleAdvanceTime}
                  className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Advance {advanceDays || '1'} Day{advanceDays !== '1' ? 's' : ''}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-terminal-primary/70">No date set</div>
          )}
        </CardContent>
      </Card>

      {/* Events Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-terminal-primary">Upcoming Events</h2>
          <p className="text-terminal-primary/70 text-sm">
            {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <Button
          onClick={() => setShowEventForm(true)}
          className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      {/* Event Creator Form */}
      {showEventForm && (
        <Card className="bg-black border-terminal-primary/50 mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-terminal-primary text-sm">Create New Event</CardTitle>
              <Button
                onClick={() => setShowEventForm(false)}
                variant="ghost"
                size="sm"
                className="text-terminal-primary hover:bg-terminal-primary/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Input
                  placeholder="Event title *"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="bg-black border-terminal-primary/50 text-terminal-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <Textarea
                  placeholder="Description (optional)"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={2}
                  className="bg-black border-terminal-primary/50 text-terminal-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-terminal-primary/70 mb-1 block">
                  Event Type
                </label>
                <Select value={eventType} onValueChange={(v: any) => setEventType(v)}>
                  <SelectTrigger className="bg-black border-terminal-primary/50 text-terminal-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-terminal-primary/50">
                    <SelectItem value="event" className="text-terminal-primary">Event</SelectItem>
                    <SelectItem value="deadline" className="text-terminal-primary">Deadline</SelectItem>
                    <SelectItem value="reminder" className="text-terminal-primary">Reminder</SelectItem>
                    <SelectItem value="travel" className="text-terminal-primary">Travel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-terminal-primary/70 mb-1 block">
                  Imperial Date *
                </label>
                <Input
                  placeholder="e.g., 135-1105"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={`bg-black text-terminal-primary ${eventDate && !imperialDateValid ? 'border-red-500/70' : 'border-terminal-primary/50'}`}
                />
                {eventDate && !imperialDateValid && (
                  <p className="text-xs text-red-400 mt-1">Format must be DDD-YYYY (e.g., 135-1105)</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-terminal-primary/70 mb-1 block">
                  Location
                </label>
                <Input
                  placeholder="Planet, System, Station, etc."
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="bg-black border-terminal-primary/50 text-terminal-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={eventIsRecurring}
                  onChange={(e) => setEventIsRecurring(e.target.checked)}
                  className="rounded border-terminal-primary/50"
                />
                <label htmlFor="recurring" className="text-sm text-terminal-primary cursor-pointer">
                  Recurring Event
                </label>
              </div>

              {eventIsRecurring && (
                <div>
                  <label className="text-xs text-terminal-primary/70 mb-1 block">
                    Recurrence (Days)
                  </label>
                  <Input
                    type="number"
                    placeholder="7"
                    value={eventRecurrenceDays}
                    onChange={(e) => setEventRecurrenceDays(e.target.value)}
                    className="bg-black border-terminal-primary/50 text-terminal-primary"
                  />
                </div>
              )}

              {isGM && (
                <div className="sm:col-span-2">
                  <label className="text-xs text-terminal-primary/70 mb-1 block">
                    Crew Scope
                  </label>
                  <CrewVisibilitySelector
                    value={eventVisibleCrewIds}
                    onChange={setEventVisibleCrewIds}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateEvent}
                disabled={!eventTitle.trim() || !eventDate.trim() || !imperialDateValid}
                size="sm"
                className="bg-terminal-primary/20 text-terminal-primary hover:bg-terminal-primary/30"
              >
                <Save className="h-4 w-4 mr-1" />
                Create Event
              </Button>
              <Button
                onClick={() => setShowEventForm(false)}
                variant="outline"
                size="sm"
                className="border-terminal-primary/50 text-terminal-primary hover:bg-terminal-primary/20"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-terminal-primary/70">
            Loading events...
          </div>
        ) : upcomingEvents.length === 0 ? (
          <Card className="bg-black border-terminal-primary/30">
            <CardContent className="p-8 text-center text-terminal-primary/70">
              No upcoming events. Create an event to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className={`bg-black border-terminal-primary/30 ${
                  event.is_completed ? 'opacity-50' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{eventTypeIcons[event.event_type]}</span>
                        <Badge className={eventTypeColors[event.event_type]}>
                          {event.event_type}
                        </Badge>
                        {event.is_recurring && (
                          <Badge className="bg-terminal-primary/20 text-terminal-primary border-terminal-primary/50">
                            Recurring
                          </Badge>
                        )}
                        {event.is_completed && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {isGM && <CrewVisibilityBadge ids={event.visible_crew_ids} />}
                      </div>
                      <CardTitle className={`text-terminal-primary ${event.is_completed ? 'line-through' : ''}`}>
                        {event.title}
                      </CardTitle>
                    </div>

                    <div className="flex gap-1">
                      {!event.is_completed && (
                        <Button
                          onClick={() => handleCompleteEvent(event.id)}
                          variant="ghost"
                          size="sm"
                          className="text-green-400 hover:bg-green-500/20 hover:text-green-300"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteEvent(event.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {event.description && (
                    <p className="text-terminal-primary/80 text-sm mb-3">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-terminal-primary/70">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {event.imperial_date}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                    {event.is_recurring && event.recurrence_interval && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Every {event.recurrence_interval} days
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
