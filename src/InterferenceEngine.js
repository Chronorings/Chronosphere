export function calculateInterference(phases) {
  if (phases.length === 0) return 0;

  const sum = phases.reduce((acc, p) => acc + Math.cos(p), 0);
  return Math.abs(sum / phases.length);
}