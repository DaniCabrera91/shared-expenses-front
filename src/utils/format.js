export const formatCurrency = (amount, currency = "EUR") => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(amount ?? 0);
};
