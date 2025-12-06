/* Updated for Vercel deployment */

export const projectId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]) || "ifijijocxohjhoznmbry"
export const publicAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmaWppam9jeG9oamhvem5tYnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDI1OTUsImV4cCI6MjA3OTMxODU5NX0.tqhUhhsLQNTEL8dtfK2_0MLdDXcNeJ0EruAPapC-M30"