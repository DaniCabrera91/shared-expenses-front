/**
 * Calculate equal split: everyone pays the same
 */
export const calculateEqualSplit = (totalAmount, participantUserIds) => {
  if (participantUserIds.length === 0) return [];
  const amountPerPerson = Number((totalAmount / participantUserIds.length).toFixed(2));
  const remainder = totalAmount - (amountPerPerson * participantUserIds.length);

  return participantUserIds.map((userId, index) => ({
    user_id: userId,
    amount_owed: index === 0 ? amountPerPerson + remainder : amountPerPerson,
  }));
};

/**
 * Calculate proportional split: based on given amounts/percentages
 */
export const calculateProportionalSplit = (totalAmount, participantData) => {
  // participantData: array of { user_id, proportion: number (0-1 or percentage) }
  const totalProportion = participantData.reduce((sum, p) => sum + p.proportion, 0);

  if (totalProportion === 0) {
    throw new Error("Total proportion must be greater than 0");
  }

  return participantData.map((data) => ({
    user_id: data.user_id,
    amount_owed: Number((totalAmount * (data.proportion / totalProportion)).toFixed(2)),
  }));
};

/**
 * Custom split: user specifies exact amounts
 */
export const validateCustomSplit = (totalAmount, shares) => {
  const totalShares = shares.reduce((sum, share) => sum + share.amount_owed, 0);
  const tolerance = 0.01; // Allow small rounding differences

  if (Math.abs(totalShares - totalAmount) > tolerance) {
    throw new Error(
      `Total shares (${totalShares.toFixed(2)}) must equal total amount (${totalAmount.toFixed(2)})`,
    );
  }

  return shares;
};

/**
 * Get supported categories
 */
export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Comida" },
  { value: "transport", label: "Transporte" },
  { value: "accommodation", label: "Alojamiento" },
  { value: "entertainment", label: "Entretenimiento" },
  { value: "utilities", label: "Servicios" },
  { value: "other", label: "Otro" },
];

export const getCategoryLabel = (categoryValue) => {
  const cat = EXPENSE_CATEGORIES.find((c) => c.value === categoryValue);
  return cat?.label || "Otro";
};
