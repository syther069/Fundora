/**
 * organizerStorage.ts
 *
 * Local persistence and types for organizer profiles.
 */

export interface OrganizerProfile {
  address: string
  username: string
  organization: string
  role: string
  website?: string
  twitter?: string
  bio: string
  appliedAt: string
}

const ORGANIZER_PROFILE_KEY_PREFIX = 'fundora_organizer_profile_'

export function saveOrganizerProfile(profile: OrganizerProfile): void {
  try {
    const key = `${ORGANIZER_PROFILE_KEY_PREFIX}${profile.address.toLowerCase()}`
    localStorage.setItem(key, JSON.stringify(profile))
  } catch (err) {
    console.warn('Failed to save organizer profile to localStorage', err)
  }
}

export function loadOrganizerProfile(address?: string): OrganizerProfile | null {
  if (!address) return null
  try {
    const key = `${ORGANIZER_PROFILE_KEY_PREFIX}${address.toLowerCase()}`
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as OrganizerProfile
  } catch {
    return null
  }
}

