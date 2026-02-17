import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { CalendarEvent, ImperialDate } from '@/types/calendar';
import { dbHelpers } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  getCurrentImperialDate,
  parseImperialDate,
  createImperialDate,
  addDays,
  formatImperialDate,
} from '@/lib/calendar/imperialCalendar';

interface CalendarContextType {
  // Current date
  currentDate: ImperialDate | null;
  setCurrentDate: (date: ImperialDate) => Promise<void>;
  advanceTime: (days: number) => Promise<void>;

  // Events
  events: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  isLoading: boolean;

  // Event CRUD
  getAllEvents: () => Promise<void>;
  getUpcomingEvents: (limit?: number) => Promise<void>;
  createEvent: (eventData: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  completeEvent: (eventId: string) => Promise<CalendarEvent | null>;

  // Utilities
  formatDate: (date: ImperialDate) => string;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [currentDate, setCurrentDateState] = useState<ImperialDate | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mount guard to prevent setState on unmounted provider
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // Load current date and events on mount
  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Load current campaign date
        const dateData = await dbHelpers.getCurrentCampaignDate();
        if (cancelled) return;
        if (dateData) {
          const parsed = parseImperialDate(dateData.imperial_date);
          if (parsed) {
            setCurrentDateState(parsed);
          }
        } else {
          // Initialize with default date
          const defaultDate = getCurrentImperialDate(1105);
          await dbHelpers.setCurrentCampaignDate(
            defaultDate.formatted,
            defaultDate.day,
            defaultDate.year
          );
          if (cancelled) return;
          setCurrentDateState(defaultDate);
        }

        // Load all events
        const eventsData = await dbHelpers.getAllCalendarEvents();
        if (cancelled) return;
        setEvents(eventsData as CalendarEvent[]);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load calendar data:', error);
        // Fallback to default date
        setCurrentDateState(getCurrentImperialDate(1105));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadInitialData();
    return () => { cancelled = true; };
  }, []);

  // Load upcoming events when current date changes
  useEffect(() => {
    if (!currentDate) return;
    let cancelled = false;

    const loadUpcoming = async () => {
      try {
        const data = await dbHelpers.getUpcomingCalendarEvents(currentDate.formatted, 10);
        if (!cancelled) setUpcomingEvents(data as CalendarEvent[]);
      } catch (error) {
        if (!cancelled) console.error('Failed to fetch upcoming events:', error);
      }
    };

    loadUpcoming();
    return () => { cancelled = true; };
  }, [currentDate]);

  const setCurrentDate = useCallback(async (date: ImperialDate) => {
    try {
      await dbHelpers.setCurrentCampaignDate(date.formatted, date.day, date.year);
      if (!mountedRef.current) return;
      setCurrentDateState(date);

      toast({
        title: "Date Updated",
        description: `Current date set to ${date.formatted}`,
      });
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Failed to set current date:', error);
      toast({
        title: "Error",
        description: "Failed to update current date",
        variant: "destructive",
      });
    }
  }, [toast]);

  const advanceTime = useCallback(async (days: number) => {
    if (!currentDate) return;

    const newDate = addDays(currentDate, days);
    await setCurrentDate(newDate);
  }, [currentDate, setCurrentDate]);

  const getAllEvents = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsLoading(true);
    try {
      const data = await dbHelpers.getAllCalendarEvents();
      if (!mountedRef.current) return;
      setEvents(data as CalendarEvent[]);
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Failed to fetch events:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      });
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [toast]);

  const getUpcomingEvents = useCallback(async (limit: number = 10) => {
    if (!currentDate || !mountedRef.current) return;

    try {
      const data = await dbHelpers.getUpcomingCalendarEvents(currentDate.formatted, limit);
      if (mountedRef.current) setUpcomingEvents(data as CalendarEvent[]);
    } catch (error) {
      if (mountedRef.current) console.error('Failed to fetch upcoming events:', error);
    }
  }, [currentDate]);

  const createEvent = useCallback(async (eventData: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    try {
      const newEvent = {
        player_id: 'campaign',
        title: eventData.title || 'New Event',
        event_type: eventData.event_type || 'reminder',
        imperial_date: eventData.imperial_date || currentDate?.formatted || '001-1105',
        is_recurring: eventData.is_recurring || false,
        recurrence_interval: eventData.recurrence_interval || 1,
        auto_deduct_credits: eventData.auto_deduct_credits || false,
        completed: false,
        ...eventData,
      };

      const saved = await dbHelpers.saveCalendarEvent(newEvent);
      if (!mountedRef.current) return null;
      const savedEvent = saved as CalendarEvent;

      setEvents(prev => [...prev, savedEvent]);

      toast({
        title: "Event Created",
        description: `${savedEvent.title} has been added to the calendar.`,
      });

      return savedEvent;
    } catch (error) {
      if (!mountedRef.current) return null;
      console.error('Failed to create event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
      return null;
    }
  }, [currentDate, toast]);

  const updateEvent = useCallback(async (
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent | null> => {
    try {
      const updated = await dbHelpers.saveCalendarEvent({ id: eventId, ...updates });
      if (!mountedRef.current) return null;
      const updatedEvent = updated as CalendarEvent;

      setEvents(prev =>
        prev.map(e => e.id === eventId ? updatedEvent : e)
      );

      toast({
        title: "Event Updated",
        description: "Calendar event has been updated.",
      });

      return updatedEvent;
    } catch (error) {
      if (!mountedRef.current) return null;
      console.error('Failed to update event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      await dbHelpers.deleteCalendarEvent(eventId);
      if (!mountedRef.current) return false;

      setEvents(prev => prev.filter(e => e.id !== eventId));
      setUpcomingEvents(prev => prev.filter(e => e.id !== eventId));

      toast({
        title: "Event Deleted",
        description: "Calendar event has been removed.",
      });

      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      console.error('Failed to delete event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const completeEvent = useCallback(async (eventId: string): Promise<CalendarEvent | null> => {
    return updateEvent(eventId, { completed: true });
  }, [updateEvent]);

  const formatDate = useCallback((date: ImperialDate): string => {
    return formatImperialDate(date.day, date.year);
  }, []);

  const value: CalendarContextType = {
    currentDate,
    setCurrentDate,
    advanceTime,
    events,
    upcomingEvents,
    isLoading,
    getAllEvents,
    getUpcomingEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent,
    formatDate,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};
