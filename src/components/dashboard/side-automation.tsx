import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import AutomationModal from "../ui/AutomationModal";

interface Automation {
  id: string;
  message: string;
  conversationId: string;
  frequency: number;
  maxExecutions: number;
}

const SidebarAutomations: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        const { data } = await axios.get<Automation[]>("/api/automations");
        setAutomations(data);
      } catch (error) {
        console.error("Error fetching automations:", error);
      }
    };
    fetchAutomations();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/automations/${id}`);
      setAutomations((prev) => prev.filter((automation) => automation.id !== id));
    } catch (error) {
      console.error("Error deleting automation:", error);
    }
  };

  const handleEdit = (automation: Automation) => {
    setSelectedAutomation(automation);
    setIsEditModalOpen(true);
  };

  const handleCollapseToggle = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="sidebar-section">
      <div className="sidebar-header" onClick={handleCollapseToggle}>
        <h4>Automations</h4>
        <span>{isCollapsed ? "+" : "-"}</span>
      </div>
      {!isCollapsed && (
        <ul className="automation-list">
          {automations.map((automation) => (
            <li key={automation.id} className="automation-item">
              <span
                onClick={() => router.push(`/conversation/${automation.conversationId}`)}
                className="automation-title"
              >
                {automation.message}
              </span>
              <div className="automation-actions">
                <button onClick={() => handleEdit(automation)}>Edit</button>
                <button onClick={() => handleDelete(automation.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {isEditModalOpen && selectedAutomation && (
        <EditAutomationModal
          automation={selectedAutomation}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedAutomation) => {
            setAutomations((prev) =>
              prev.map((auto) => (auto.id === updatedAutomation.id ? updatedAutomation : auto))
            );
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SidebarAutomations;

