import { supabase } from "@/integrations/supabase/client";

const MISSING_COL_REGEX = /Could not find the '([^']+)' column|Could not find the "([^"]+)" column|column "([^"]+)" of relation/;

function extractMissingColumn(message: string): string | null {
  const m = message.match(MISSING_COL_REGEX);
  if (!m) return null;
  return m[1] || m[2] || m[3] || null;
}

/**
 * Insert a single row defensively: if the server errors complaining about a missing column,
 * remove that column from the payload and retry (up to all keys removed).
 */
export async function safeInsert(table: string, row: Record<string, any>) {
  const tried = new Set<string>();
  let payload = { ...row };

  while (true) {
    const res = await supabase.from(table).insert([payload]);
    if (!res.error) return res;

    const msg = res.error.message || "";
    const missing = extractMissingColumn(msg);
    if (!missing || tried.has(missing) || !(missing in payload)) {
      // Can't handle this error defensively
      return res;
    }

    // Remove the missing column and retry
    tried.add(missing);
    delete payload[missing];
  }
}

/**
 * Update a single row defensively: like safeInsert but uses .update() and .eq(keyName, keyValue)
 */
export async function safeUpdate(table: string, row: Record<string, any>, keyName: string, keyValue: any) {
  const tried = new Set<string>();
  let payload = { ...row };

  while (true) {
    const res = await supabase.from(table).update(payload).eq(keyName, keyValue);
    if (!res.error) return res;

    const msg = res.error.message || "";
    const missing = extractMissingColumn(msg);
    if (!missing || tried.has(missing) || !(missing in payload)) {
      return res;
    }

    tried.add(missing);
    delete payload[missing];
  }
}

export default { safeInsert, safeUpdate };
