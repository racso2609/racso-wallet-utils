export function formatUsd(value: number): string {
  if (value === 0) return "$0.00";
  return value >= 0.01
    ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${value.toPrecision(4)}`;
}
