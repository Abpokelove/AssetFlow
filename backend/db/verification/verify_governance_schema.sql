-- Verification script for the newly added governance tables and indexes

-- 1. Check if the tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'maintenance_requests',
    'audit_cycles',
    'audit_assignments',
    'audit_items',
    'notifications',
    'activity_logs'
  )
ORDER BY table_name;

-- 2. Check the column definitions for the new tables
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'maintenance_requests',
    'audit_cycles',
    'audit_assignments',
    'audit_items',
    'notifications',
    'activity_logs'
  )
ORDER BY table_name, ordinal_position;

-- 3. Check table constraints (Foreign keys, Unique, Check)
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM 
    information_schema.table_constraints AS tc
WHERE 
    tc.table_schema = 'public'
    AND tc.table_name IN (
      'maintenance_requests',
      'audit_cycles',
      'audit_assignments',
      'audit_items',
      'notifications',
      'activity_logs'
    )
ORDER BY 
    tc.table_name, tc.constraint_type;

-- 4. Check the indexes created
SELECT 
    tablename, 
    indexname, 
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public'
    AND tablename IN (
      'maintenance_requests',
      'audit_cycles',
      'audit_assignments',
      'audit_items',
      'notifications',
      'activity_logs'
    )
ORDER BY 
    tablename, indexname;
