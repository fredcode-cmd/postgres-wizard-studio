
-- Create a function to execute arbitrary SQL queries
CREATE OR REPLACE FUNCTION public.execute_sql(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    result_array JSONB := '[]'::JSONB;
    query_upper TEXT;
BEGIN
    query_upper := UPPER(TRIM(query_text));
    
    -- For SELECT statements, return the results as a JSONB array
    IF query_upper LIKE 'SELECT%' OR query_upper LIKE 'WITH%' THEN
        FOR rec IN EXECUTE query_text LOOP
            result_array := result_array || to_jsonb(rec);
        END LOOP;
        RETURN result_array;
    ELSE
        -- For other statements (INSERT, UPDATE, DELETE, CREATE, etc.), just execute
        EXECUTE query_text;
        RETURN '{"message": "Query executed successfully", "affected_rows": 0}'::JSONB;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Return error information
    RETURN json_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE,
        'state', SQLSTATE
    )::JSONB;
END;
$$;

-- Create a function to get table information
CREATE OR REPLACE FUNCTION public.get_table_info()
RETURNS TABLE(
    table_name TEXT,
    table_schema TEXT,
    table_type TEXT,
    columns JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        t.table_schema::TEXT,
        t.table_type::TEXT,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'column_name', c.column_name,
                    'data_type', c.data_type,
                    'is_nullable', c.is_nullable,
                    'column_default', c.column_default,
                    'is_primary_key', CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END
                )
            )
            FROM information_schema.columns c
            LEFT JOIN (
                SELECT kcu.column_name, kcu.table_name, kcu.table_schema
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'PRIMARY KEY'
            ) pk ON pk.column_name = c.column_name 
                AND pk.table_name = c.table_name 
                AND pk.table_schema = c.table_schema
            WHERE c.table_name = t.table_name 
                AND c.table_schema = t.table_schema
            ORDER BY c.ordinal_position
            ), '[]'::JSONB
        ) as columns
    FROM information_schema.tables t
    WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog', 'auth', 'storage', 'realtime', 'supabase_functions', 'vault')
    ORDER BY t.table_schema, t.table_name;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.execute_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_info() TO authenticated;
