import { create } from 'zustand'

export interface ViewportState {
  activeView: 'chat' | 'document' | 'room' | 'status'
  roomId: string | null
  sectionPanel: { open: boolean; width: number }
  statusPanel: { open: boolean; width: number }
  currentRoom: RoomState | null
}

export interface RoomState {
  id: string
  name: string
  description: string | null
  status: 'active' | 'archived' | 'onboarding'
  participants: Participant[]
  stages: StageProgress[]
  nextAction: string | null
}

export interface Participant {
  id: string
  name: string
  status: 'active' | 'pending' | 'locked'
}

export interface StageProgress {
  name: string
  status: 'current' | 'done' | 'pending'
}

interface ViewportStore extends ViewportState {
  // Actions
  setActiveView: (view: 'chat' | 'document' | 'room' | 'status') => void
  setRoomId: (id: string | null) => void
  toggleSectionPanel: () => void
  toggleStatusPanel: () => void
  openRoom: (room: RoomState) => void
  closeRoom: () => void
  updateRoomParticipants: (participantId: string, status: 'active' | 'pending' | 'locked') => void
}

export const useViewportStore = create<ViewportStore>()((set, get) => ({
  activeView: 'chat',
  roomId: null,
  sectionPanel: { open: true, width: 60 },
  statusPanel: { open: true, width: 200 },
  currentRoom: null,

  setActiveView: (activeView) => set({ activeView }),
  setRoomId: (roomId) => set({ roomId }),
  toggleSectionPanel: () => set((state) => ({
    sectionPanel: { ...state.sectionPanel, open: !state.sectionPanel.open }
  })),
  toggleStatusPanel: () => set((state) => ({
    statusPanel: { ...state.statusPanel, open: !state.statusPanel.open }
  })),
  openRoom: (currentRoom) => set({ currentRoom, activeView: 'room' }),
  closeRoom: () => set({ currentRoom: null, activeView: 'chat' }),
  updateRoomParticipants: (participantId, status) => set((state) => {
    if (!state.currentRoom) return state
    const participants = state.currentRoom.participants.map(p =>
      p.id === participantId ? { ...p, status } : p
    )
    return {
      currentRoom: { ...state.currentRoom, participants }
    }
  })
}))