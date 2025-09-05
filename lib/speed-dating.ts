import { supabase } from './supabase';

export interface SpeedDatingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration_minutes: number;
  price: number;
  max_participants: number;
  registered_males: number;
  registered_females: number;
  status: 'upcoming' | 'registration_open' | 'full' | 'live' | 'completed';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SpeedDatingRegistration {
  id: string;
  event_id: string;
  user_id: string;
  emergency_contact: string;
  emergency_phone: string;
  dietary_restrictions?: string;
  expectations?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_reference?: string;
  registration_date: string;
  created_at: string;
}

export interface SpeedDatingRoom {
  id: string;
  event_id: string;
  room_name: string;
  participant1_id: string;
  participant2_id: string;
  start_time: string;
  end_time: string;
  status: 'waiting' | 'active' | 'completed';
  created_at: string;
}

// Get all speed dating events
export const getSpeedDatingEvents = async (): Promise<{ events: SpeedDatingEvent[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('speed_dating_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return { events: data || [], error: null };
  } catch (error) {
    return { events: [], error };
  }
};

// Get event by ID
export const getSpeedDatingEvent = async (eventId: string): Promise<{ event: SpeedDatingEvent | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('speed_dating_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return { event: data, error: null };
  } catch (error) {
    return { event: null, error };
  }
};

// Register for speed dating event
export const registerForSpeedDating = async (
  eventId: string,
  userId: string,
  registrationData: {
    emergency_contact: string;
    emergency_phone: string;
    dietary_restrictions?: string;
    expectations?: string;
  }
): Promise<{ registration: SpeedDatingRegistration | null; error: any }> => {
  try {
    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('speed_dating_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existingRegistration) {
      throw new Error('You are already registered for this event');
    }

    // Check event capacity
    const { data: event } = await supabase
      .from('speed_dating_events')
      .select('max_participants, registered_males, registered_females')
      .eq('id', eventId)
      .single();

    if (!event) {
      throw new Error('Event not found');
    }

    // Get user gender to check capacity
    const { data: user } = await supabase
      .from('users')
      .select('gender')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    const isMale = user.gender === 'Male';
    const currentCount = isMale ? event.registered_males : event.registered_females;

    if (currentCount >= event.max_participants) {
      throw new Error(`Event is full for ${user.gender.toLowerCase()}s`);
    }

    // Create registration
    const { data, error } = await supabase
      .from('speed_dating_registrations')
      .insert({
        event_id: eventId,
        user_id: userId,
        ...registrationData,
        payment_status: 'pending',
        registration_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update event participant count
    const updateField = isMale ? 'registered_males' : 'registered_females';
    await supabase
      .from('speed_dating_events')
      .update({ [updateField]: currentCount + 1 })
      .eq('id', eventId);

    return { registration: data, error: null };
  } catch (error) {
    return { registration: null, error };
  }
};

// Update payment status
export const updatePaymentStatus = async (
  registrationId: string,
  status: 'completed' | 'failed',
  paymentReference?: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('speed_dating_registrations')
      .update({
        payment_status: status,
        payment_reference: paymentReference,
      })
      .eq('id', registrationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Get user's registrations
export const getUserSpeedDatingRegistrations = async (userId: string): Promise<{ registrations: any[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('speed_dating_registrations')
      .select(`
        *,
        event:speed_dating_events(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { registrations: data || [], error: null };
  } catch (error) {
    return { registrations: [], error };
  }
};

// Create speed dating rooms for an event
export const createSpeedDatingRooms = async (eventId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    // Get all registered participants
    const { data: registrations } = await supabase
      .from('speed_dating_registrations')
      .select(`
        user_id,
        users(gender)
      `)
      .eq('event_id', eventId)
      .eq('payment_status', 'completed');

    if (!registrations) {
      throw new Error('No registrations found');
    }

    const males = registrations.filter(r => r.users.gender === 'Male').map(r => r.user_id);
    const females = registrations.filter(r => r.users.gender === 'Female').map(r => r.user_id);

    const rooms: any[] = [];
    const sessionDuration = 5; // 5 minutes per session

    // Create rooms for each male-female combination
    let sessionIndex = 0;
    for (const maleId of males) {
      for (const femaleId of females) {
        const startTime = new Date();
        startTime.setMinutes(startTime.getMinutes() + (sessionIndex * sessionDuration));
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + sessionDuration);

        rooms.push({
          event_id: eventId,
          room_name: `Room ${sessionIndex + 1}`,
          participant1_id: maleId,
          participant2_id: femaleId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'waiting',
        });

        sessionIndex++;
      }
    }

    // Insert all rooms
    const { error } = await supabase
      .from('speed_dating_rooms')
      .insert(rooms);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Get rooms for a user in an event
export const getUserSpeedDatingRooms = async (
  eventId: string,
  userId: string
): Promise<{ rooms: SpeedDatingRoom[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('speed_dating_rooms')
      .select(`
        *,
        participant1:users!speed_dating_rooms_participant1_id_fkey(id, name, profile_photos),
        participant2:users!speed_dating_rooms_participant2_id_fkey(id, name, profile_photos)
      `)
      .eq('event_id', eventId)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return { rooms: data || [], error: null };
  } catch (error) {
    return { rooms: [], error };
  }
};

// Update room status
export const updateRoomStatus = async (
  roomId: string,
  status: 'active' | 'completed'
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('speed_dating_rooms')
      .update({ status })
      .eq('id', roomId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};