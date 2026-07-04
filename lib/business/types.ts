// Business Project Management Types
// Matches migration 008_create_business_project_tables.sql

// ============================================================================
// ENUMS
// ============================================================================

export type ProjectRoleStatus = 'searching' | 'pipeline' | 'found' | 'active' | 'filled' | 'cancelled'
export type LocationRequirement = 'sacred_valley' | 'global_remote' | 'flexible'
export type MeetingMode = 'in_person' | 'online' | 'hybrid'
export type PreferredMeetingMode = 'in_person' | 'online' | 'no_preference'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type BountyType = 'cash' | 'equity_points' | 'commission' | 'priority_access'
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'expert'
export type AssignmentStatus = 'pending' | 'active' | 'on-hold' | 'completed' | 'cancelled'
export type ReferralStatus = 'pending' | 'submitted' | 'contacted' | 'interviewing' | 'hired' | 'rejected' | 'withdrawn'
export type AvailabilityType = 'full-time' | 'part-time' | 'project-based' | 'on-call'
export type ProjectType = 'short-term' | 'long-term' | 'ongoing'
export type RateType = 'hourly' | 'fixed' | 'equity' | 'hybrid'
export type AssignmentType = 'direct' | 'referral' | 'application'

// ============================================================================
// INTERFACES
// ============================================================================

export interface ProjectRole {
  id: string
  user_id: string
  project_name: string
  project_phase?: string
  title: string
  description?: string
  category?: string
  required_skills?: string[]
  experience_level?: ExperienceLevel
  time_commitment_hours?: number
  duration_weeks?: number
  location_requirement: LocationRequirement
  meeting_mode: MeetingMode
  hub_location?: string
  status: ProjectRoleStatus
  referral_bounty: number
  bounty_type?: BountyType
  is_public: boolean
  referral_deadline?: string
  contact_email?: string
  approach_notes?: string
  priority: Priority
  created_at: string
  updated_at: string
}

export interface MemberOffering {
  id: string
  user_id: string
  member_name?: string
  member_email?: string
  skill_category: string
  skill_title: string
  skill_description?: string
  skill_tags?: string[]
  based_location?: string
  willing_to_travel: boolean
  available_hubs?: string[]
  preferred_meeting_mode: PreferredMeetingMode
  availability_hours?: number
  availability_type?: AvailabilityType
  preferred_project_type?: ProjectType
  rate_type?: RateType
  rate_min?: number
  rate_max?: number
  is_active: boolean
  is_seeking_work: boolean
  portfolio_url?: string
  case_studies?: string
  created_at: string
  updated_at: string
}

export interface WorkAssignment {
  id: string
  user_id: string
  role_id: string
  member_id: string
  assigned_by?: string
  assignment_type?: AssignmentType
  meeting_mode?: MeetingMode
  hub_location?: string
  online_meeting_url?: string
  status: AssignmentStatus
  started_at?: string
  expected_end_at?: string
  ended_at?: string
  actual_hours_worked: number
  deliverables?: string
  notes?: string
  agreed_rate?: number
  total_paid: number
  performance_rating?: number
  performance_notes?: string
  created_at: string
  updated_at: string
  role?: ProjectRole
  member?: MemberOffering
}

export interface RoleReferral {
  id: string
  user_id: string
  role_id: string
  referrer_member_id: string
  referrer_name?: string
  referrer_email?: string
  referred_person_name: string
  referred_person_email?: string
  referred_person_phone?: string
  referred_person_linkedin?: string
  referred_person_portfolio?: string
  referred_person_notes?: string
  referred_person_location?: string
  can_relocate: boolean
  status: ReferralStatus
  bounty_eligible: boolean
  bounty_amount?: number
  bounty_paid: boolean
  bounty_paid_at?: string
  bounty_notes?: string
  referred_at: string
  contacted_at?: string
  interviewed_at?: string
  hired_at?: string
  rejected_at?: string
  rejection_reason?: string
  internal_notes?: string
  created_at: string
  updated_at: string
  role?: ProjectRole
}

export interface NetworkSkillMatch {
  role_id: string
  role_title: string
  role_category: string
  required_skills?: string[]
  location_requirement: LocationRequirement
  meeting_mode: MeetingMode
  hub_location?: string
  offering_id: string
  member_name?: string
  member_email?: string
  skill_title: string
  skill_category: string
  based_location?: string
  available_hubs?: string[]
  preferred_meeting_mode: PreferredMeetingMode
  availability_hours?: number
  is_seeking_work: boolean
  location_match_score: number
  matching_skills_count: number
}

export interface ProjectInfo {
  name: string
  phase: string
  vision: string
  milestones: {
    id: string
    title: string
    target_date: string
    completed: boolean
  }[]
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const SAMPLE_PROJECT_INFO: ProjectInfo = {
  name: "Resourceful",
  phase: "V1 - Sacred Valley Launch",
  vision: "Building a distributed community platform connecting digital nomads with local hubs. Starting in Sacred Valley, Peru.",
  milestones: [
    { id: '1', title: 'Core platform MVP', target_date: '2026-03-15', completed: true },
    { id: '2', title: 'Sacred Valley hub launch', target_date: '2026-04-01', completed: false },
    { id: '3', title: 'First 10 active members', target_date: '2026-05-01', completed: false },
    { id: '4', title: 'Revenue generation', target_date: '2026-06-01', completed: false },
  ]
}

export const SAMPLE_ROLES: ProjectRole[] = [
  {
    id: '1',
    user_id: 'user-1',
    project_name: 'Resourceful',
    project_phase: 'V1 - Sacred Valley Launch',
    title: 'Frontend Developer',
    description: 'Build responsive UI components and implement design system for the platform.',
    category: 'engineering',
    required_skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    experience_level: 'senior',
    time_commitment_hours: 20,
    duration_weeks: 12,
    location_requirement: 'flexible',
    meeting_mode: 'hybrid',
    hub_location: 'sacred_valley',
    status: 'searching',
    referral_bounty: 500,
    bounty_type: 'cash',
    is_public: true,
    referral_deadline: '2026-03-15T00:00:00Z',
    priority: 'high',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-20T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    project_name: 'Resourceful',
    title: 'Event Operations Manager',
    description: 'Coordinate community events, workshops, and gatherings at Sacred Valley hub.',
    category: 'operations',
    required_skills: ['Event planning', 'Community management', 'Logistics'],
    experience_level: 'mid',
    time_commitment_hours: 15,
    duration_weeks: 8,
    location_requirement: 'sacred_valley',
    meeting_mode: 'in_person',
    hub_location: 'sacred_valley',
    status: 'pipeline',
    referral_bounty: 300,
    bounty_type: 'equity_points',
    is_public: true,
    priority: 'medium',
    created_at: '2026-02-05T00:00:00Z',
    updated_at: '2026-02-20T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'user-1',
    project_name: 'Resourceful',
    title: 'Finance Advisor',
    description: 'Advise on financial planning, pricing strategy, and revenue models.',
    category: 'finance',
    required_skills: ['Financial planning', 'Pricing strategy', 'SaaS models'],
    experience_level: 'expert',
    time_commitment_hours: 5,
    duration_weeks: 4,
    location_requirement: 'global_remote',
    meeting_mode: 'online',
    status: 'found',
    referral_bounty: 0,
    is_public: false,
    priority: 'low',
    created_at: '2026-02-10T00:00:00Z',
    updated_at: '2026-02-20T00:00:00Z',
  },
  {
    id: '4',
    user_id: 'user-1',
    project_name: 'Resourceful',
    title: 'Content Strategist',
    description: 'Develop content strategy and manage social media presence.',
    category: 'marketing',
    required_skills: ['Content strategy', 'Social media', 'Community building'],
    experience_level: 'mid',
    time_commitment_hours: 10,
    duration_weeks: 6,
    location_requirement: 'global_remote',
    meeting_mode: 'online',
    status: 'active',
    referral_bounty: 0,
    is_public: false,
    priority: 'medium',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-02-15T00:00:00Z',
  },
]

export const SAMPLE_ASSIGNMENTS: WorkAssignment[] = [
  {
    id: '1',
    user_id: 'user-1',
    role_id: '4',
    member_id: 'member-1',
    assigned_by: 'user-1',
    assignment_type: 'direct',
    meeting_mode: 'online',
    online_meeting_url: 'https://resourceful.daily.co/content-strategy',
    status: 'active',
    started_at: '2026-02-15T00:00:00Z',
    expected_end_at: '2026-03-30T00:00:00Z',
    actual_hours_worked: 12,
    deliverables: 'Content calendar for Q2, Social media strategy doc',
    agreed_rate: 50,
    total_paid: 600,
    created_at: '2026-02-15T00:00:00Z',
    updated_at: '2026-02-20T00:00:00Z',
    role: SAMPLE_ROLES[3],
  },
]

export const SAMPLE_REFERRALS: RoleReferral[] = [
  {
    id: '1',
    user_id: 'user-1',
    role_id: '1',
    referrer_member_id: 'member-2',
    referrer_name: 'Sarah Chen',
    referrer_email: 'sarah@example.com',
    referred_person_name: 'Alex Rivera',
    referred_person_email: 'alex@example.com',
    referred_person_linkedin: 'linkedin.com/in/alexrivera',
    referred_person_notes: 'Former colleague, excellent React developer interested in remote work.',
    referred_person_location: 'Lima, Peru',
    can_relocate: true,
    status: 'interviewing',
    bounty_eligible: true,
    bounty_amount: 500,
    bounty_paid: false,
    referred_at: '2026-02-18T00:00:00Z',
    contacted_at: '2026-02-19T00:00:00Z',
    interviewed_at: '2026-02-20T00:00:00Z',
    created_at: '2026-02-18T00:00:00Z',
    updated_at: '2026-02-20T00:00:00Z',
    role: SAMPLE_ROLES[0],
  },
]

export const SAMPLE_MATCHES: NetworkSkillMatch[] = [
  {
    role_id: '1',
    role_title: 'Frontend Developer',
    role_category: 'engineering',
    required_skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    location_requirement: 'flexible',
    meeting_mode: 'hybrid',
    hub_location: 'sacred_valley',
    offering_id: 'offering-1',
    member_name: 'Marcus Johnson',
    member_email: 'marcus@example.com',
    skill_title: 'Full-Stack Development',
    skill_category: 'engineering',
    based_location: 'Cusco, Peru',
    available_hubs: ['sacred_valley'],
    preferred_meeting_mode: 'online',
    availability_hours: 25,
    is_seeking_work: true,
    location_match_score: 1.0,
    matching_skills_count: 3,
  },
  {
    role_id: '2',
    role_title: 'Event Operations Manager',
    role_category: 'operations',
    required_skills: ['Event planning', 'Community management', 'Logistics'],
    location_requirement: 'sacred_valley',
    meeting_mode: 'in_person',
    hub_location: 'sacred_valley',
    offering_id: 'offering-2',
    member_name: 'Elena Morales',
    member_email: 'elena@example.com',
    skill_title: 'Community & Events',
    skill_category: 'operations',
    based_location: 'Pisac, Peru',
    available_hubs: ['sacred_valley'],
    preferred_meeting_mode: 'in_person',
    availability_hours: 20,
    is_seeking_work: true,
    location_match_score: 1.0,
    matching_skills_count: 2,
  },
]

// ============================================================================
// STATUS COLORS
// ============================================================================

export const STATUS_COLORS: Record<ProjectRoleStatus, { bg: string; text: string; border: string }> = {
  searching: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' },
  pipeline: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30' },
  found: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  active: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
  filled: { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/30' },
  cancelled: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/30' },
}

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  low: { bg: 'bg-gray-500/10', text: 'text-gray-600' },
  medium: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-600' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-600' },
}