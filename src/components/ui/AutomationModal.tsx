import React, { useState } from "react";
import axios from "axios";

interface Automation {
  id: string;
  message: string;
  frequency: number;
  maxExecutions: number;
}

interface EditAutomationModalProps {
  automation: Automation;
  onClose: () => void;
  onSave: (updatedAutomation: Automation) => void;
}

const EditAutomationModal: React.FC<EditAutomationModalProps> = ({
  automation,
  onClose,
  onSave,
}) => {
  const [message, setMessage] = useState(automation.message);
  const [frequency, setFrequency] = useState(automation.frequency);
  const [maxExecutions, setMaxExecutions] = useState(automation.maxExecutions);

  const handleSave = async () => {
    try {
      const updatedAutomation = {
        ...automation,
        message,
        frequency,
        maxExecutions,
      };
      const { data } = await axios.put<Automation>(`/api/automations/${automation.id}`, updatedAutomation);
      onSave(data);
    } catch (error) {
      console.error("Error updating automation:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit Automation</h3>
        <label>
          Message:
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <label>
          Frequency:
          <input
            type="number"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
          />
        </label>
        <label>
          Max Executions:
          <input
            type="number"
            value={maxExecutions}
            onChange={(e) => setMaxExecutions(Number(e.target.value))}
          />
        </label>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditAutomationModal;

