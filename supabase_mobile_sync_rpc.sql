-- Function to atomicly process a batch of harvests and update inventory
CREATE OR REPLACE FUNCTION process_harvest_sync(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    harvest_record jsonb;
    inserted_count integer := 0;
    current_product_id uuid;
    harvest_weight numeric;
BEGIN
    -- Iterate through the array of harvests in the payload
    FOR harvest_record IN SELECT * FROM jsonb_array_elements(payload)
    LOOP
        -- Extract values from JSON
        current_product_id := (harvest_record->>'product_id')::uuid;
        harvest_weight := (harvest_record->>'weight')::numeric;

        -- Insert the harvest log
        INSERT INTO harvests (
            product_id,
            weight,
            moisture,
            grade,
            location,
            status,
            timestamp,
            harvest_type
        ) VALUES (
            current_product_id,
            harvest_weight,
            (harvest_record->>'moisture')::numeric,
            harvest_record->>'grade',
            harvest_record->>'location',
            harvest_record->>'status',
            (harvest_record->>'timestamp')::timestamptz,
            harvest_record->>'harvest_type'
        );

        -- Increment product quantity
        UPDATE mushroom_products
        SET quantity_kg = quantity_kg + harvest_weight,
            available = (quantity_kg + harvest_weight)::text || 'kg'
        WHERE id = current_product_id;

        inserted_count := inserted_count + 1;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'inserted_count', inserted_count);
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback happens automatically on exception
        RAISE EXCEPTION 'Failed to process harvest sync: %', SQLERRM;
END;
$$;
