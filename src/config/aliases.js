export function getRevenueAliases(input) {
  return input.value.toLowerCase().split(",").map((item) => item.trim()).filter(Boolean);
}

export function getOutflowAliases(input) {
  return input.value.toLowerCase().split(",").map((item) => item.trim()).filter(Boolean);
}
