import { useState } from "react";
import { useGroupMembers } from "../groups/useGroupMembers";
import {
  calculateEqualSplit,
  calculateProportionalSplit,
  validateCustomSplit,
  EXPENSE_CATEGORIES,
} from "../../utils/expenseCalculations";
import "./ExpenseForm.css";

export function ExpenseForm({ groupId, onSubmit, onCancel }) {
  const { data: members = [] } = useGroupMembers(groupId);
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [category, setCategory] = useState("other");
  const [splitType, setSplitType] = useState("equal");
  const [selectedParticipants, setSelectedParticipants] = useState(new Set());
  const [customShares, setCustomShares] = useState([]);
  const [error, setError] = useState("");

  const handleToggleParticipant = (userId) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedParticipants(newSelected);
    setError("");
  };

  const handleSelectAllParticipants = () => {
    if (selectedParticipants.size === members.length) {
      setSelectedParticipants(new Set());
    } else {
      setSelectedParticipants(new Set(members.map((m) => m.user_id)));
    }
  };

  const handleCustomShareChange = (userId, amount) => {
    setCustomShares((prev) => {
      const updated = prev.filter((s) => s.user_id !== userId);
      if (amount > 0) {
        updated.push({ user_id: userId, amount_owed: parseFloat(amount) });
      }
      return updated;
    });
  };

  const calculateShares = () => {
    try {
      const participantIds = Array.from(selectedParticipants);
      if (participantIds.length === 0) {
        throw new Error("Debe seleccionar al menos un participante");
      }

      const amount = parseFloat(totalAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Cantidad debe ser mayor a 0");
      }

      let shares;
      if (splitType === "equal") {
        shares = calculateEqualSplit(amount, participantIds);
      } else if (splitType === "proportional") {
        const proportions = participantIds.map((id) => ({
          user_id: id,
          proportion: 1, // Default equal for now
        }));
        shares = calculateProportionalSplit(amount, proportions);
      } else if (splitType === "custom") {
        if (customShares.length === 0) {
          throw new Error("Debe ingresa montos para cada participante");
        }
        shares = validateCustomSplit(amount, customShares);
      }

      return shares;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!description || !totalAmount || !paidBy) {
      setError("Complete todos los campos requeridos");
      return;
    }

    const shares = calculateShares();
    if (!shares) return;

    const payload = {
      description,
      total_amount: parseFloat(totalAmount),
      currency: "EUR",
      paid_by: paidBy,
      category,
      shares,
    };

    onSubmit(payload);
  };

  const selectedCount = selectedParticipants.size;
  const allSelected = selectedCount === members.length && members.length > 0;

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label>Descripción *</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ej: Cena, Gasolina..."
        />
      </div>

      <div className="form-section">
        <label>Cantidad *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="form-section">
        <label>Categoría</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label>Pagado por *</label>
        <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          <option value="">Selecciona un miembro</option>
          {members.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {member.alias || member.first_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <div className="section-header">
          <label>Tipo de reparto *</label>
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
          >
            <option value="equal">Reparto igual</option>
            <option value="proportional">Reparto proporcional</option>
            <option value="custom">Reparto personalizado</option>
          </select>
        </div>

        <div className="participants-selector">
          <button
            type="button"
            className="select-all-btn"
            onClick={handleSelectAllParticipants}
          >
            {allSelected ? "Deseleccionar todo" : "Seleccionar todo"}
          </button>

          <div className="participants-list">
            {members.map((member) => (
              <label key={member.user_id} className="participant-checkbox">
                <input
                  type="checkbox"
                  checked={selectedParticipants.has(member.user_id)}
                  onChange={() => handleToggleParticipant(member.user_id)}
                />
                <span>{member.alias || member.first_name}</span>
              </label>
            ))}
          </div>
        </div>

        {splitType === "custom" && selectedCount > 0 && (
          <div className="custom-shares">
            <h4>Montos por persona:</h4>
            {Array.from(selectedParticipants).map((userId) => {
              const member = members.find((m) => m.user_id === userId);
              const currentShare = customShares.find(
                (s) => s.user_id === userId,
              );

              return (
                <div key={userId} className="custom-share-input">
                  <label>{member?.alias || member?.first_name}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentShare?.amount_owed || ""}
                    onChange={(e) =>
                      handleCustomShareChange(userId, e.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          Crear gasto
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
