import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Fetch all appointments
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/appointments', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch appointments' });
    }
  }
);

// Create appointment
export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create appointment' });
    }
  }
);

// Update appointment
export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/appointments/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update appointment' });
    }
  }
);

// Cancel appointment
export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async ({ id, cancelReason }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/appointments/${id}`, { data: { cancelReason } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to cancel appointment' });
    }
  }
);

// Get appointment by ID
export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch appointment' });
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [],
    selectedAppointment: null,
    loading: false,
    error: null,
    actionLoading: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
    },
    setSelectedAppointment: (state, action) => {
      state.selectedAppointment = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch appointments';
      })
      
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.appointments.unshift(action.payload.appointment);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to create appointment';
      })
      
      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.appointments.findIndex(
          (apt) => apt._id === action.payload.appointment._id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload.appointment;
        }
        if (state.selectedAppointment?._id === action.payload.appointment._id) {
          state.selectedAppointment = action.payload.appointment;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to update appointment';
      })
      
      // Cancel appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.appointments.findIndex(
          (apt) => apt._id === action.payload.appointment._id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload.appointment;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message || 'Failed to cancel appointment';
      })
      
      // Fetch appointment by ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAppointment = action.payload.appointment;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch appointment';
      });
  }
});

export const { clearError, clearSelectedAppointment, setSelectedAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;