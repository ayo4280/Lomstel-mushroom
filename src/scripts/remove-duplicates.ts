import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicates() {
  console.log('Fetching all leads...');
  const { data: leads, error } = await supabase.from('leads').select('*').order('created_at', { ascending: true });
  
  if (error || !leads) {
    console.error('Failed to fetch leads:', error);
    return;
  }

  const seenNames = new Set<string>();
  const duplicateIds: string[] = [];

  for (const lead of leads) {
    const normalizedName = lead.business_name.toLowerCase().trim();
    if (seenNames.has(normalizedName)) {
      duplicateIds.push(lead.id);
    } else {
      seenNames.add(normalizedName);
    }
  }

  console.log(`Found ${duplicateIds.length} duplicate leads to remove.`);

  if (duplicateIds.length > 0) {
    const { error: deleteError } = await supabase.from('leads').delete().in('id', duplicateIds);
    if (deleteError) {
      console.error('Error deleting duplicates:', deleteError);
    } else {
      console.log('Successfully removed duplicates.');
    }
  }
}

removeDuplicates();
