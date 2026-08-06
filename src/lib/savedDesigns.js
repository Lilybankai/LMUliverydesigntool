// Shared rules for saved designs (used by the save + my-designs dialogs).

export const MAX_DESIGNS = 20;

// Two saved designs count as duplicates when they target the same vehicle and
// share the same name (trimmed, case-insensitive). This is exactly what the old
// "every save inserts a new row" behaviour produced when a loaded design was
// re-saved, so it's the right grouping for the cleanup helper.
export function duplicateKey(design) {
  return `${(design.name || '').trim().toLowerCase()}|${design.vehicleId}`;
}

// Given a list of designs, return the ids to delete so only one copy of each
// duplicate group remains — keeping the most recently updated one. Does not
// rely on the input order.
export function findDuplicateIds(designs) {
  const groups = new Map();
  for (const d of designs || []) {
    const key = duplicateKey(d);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(d);
  }
  const remove = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const newestFirst = [...group].sort(
      (a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime()
    );
    remove.push(...newestFirst.slice(1).map(d => d.id)); // keep [0], delete the rest
  }
  return remove;
}
