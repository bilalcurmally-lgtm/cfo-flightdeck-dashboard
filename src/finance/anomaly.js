export function detectLargeTransactions(rows, { minRows = 4, multiple = 3, limit = 3 } = {}) {
  const candidates = rows
    .filter((row) => Number.isFinite(row.amount) && row.amount > 0)
    .sort((a, b) => a.amount - b.amount);
  if (candidates.length < minRows) return [];

  const medianAmount = median(candidates.map((row) => row.amount));
  if (!medianAmount) return [];

  return candidates
    .filter((row) => row.amount >= medianAmount * multiple)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
    .map((row) => ({
      ...row,
      medianAmount,
      multiple: row.amount / medianAmount
    }));
}

function median(values) {
  const middle = Math.floor(values.length / 2);
  if (values.length % 2) return values[middle];
  return (values[middle - 1] + values[middle]) / 2;
}
