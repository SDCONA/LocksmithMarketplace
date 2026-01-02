# ⚠️ CRITICAL DEVELOPMENT NOTES ⚠️

## ABSOLUTELY DO NOT USE KV STORE

**DO NOT USE KV STORE.**

**Use existing database tables or create new tables if needed.**

**If you need to store data:**
1. Check existing tables first
2. Create new tables if necessary
3. Ask user to run SQL queries to verify table structure
4. Provide SQL for user to execute and return results

**NEVER assume KV store exists or works.**
**NEVER use `kv.set()`, `kv.get()`, or any KV store operations.**

---

## Database Architecture

- This project uses **PostgreSQL via Supabase**
- There are **25+ tables** in the schema
- Always use proper tables with RLS policies
- Always verify table existence before using it

---

**READ THIS FILE EVERY TIME BEFORE MAKING CHANGES**
