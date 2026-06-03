import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  // Check the latest task log
  const { data: tasks } = await s.from('ai_tasks').select('*').order('started_at', { ascending: false }).limit(3);
  console.log('\n=== LATEST AI TASKS ===');
  for (const t of tasks || []) {
    console.log(`[${t.status}] ${t.task_name} | leads_found: ${t.leads_found} | logs: ${t.logs}`);
  }

  // Check all leads by business type
  const { data: leads } = await s.from('leads').select('business_name, business_type').order('created_at', { ascending: false });
  const byType: Record<string, string[]> = {};
  for (const l of leads || []) {
    const type = l.business_type || 'Unknown';
    if (!byType[type]) byType[type] = [];
    byType[type].push(l.business_name);
  }
  console.log('\n=== LEADS BY TYPE ===');
  for (const [type, names] of Object.entries(byType)) {
    console.log(`\n[${type}] (${names.length}):`);
    names.forEach(n => console.log(`  - ${n}`));
  }
}

main().catch(console.error);
