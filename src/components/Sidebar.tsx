import React from "react";
import { FileUp, FileDown, Plus } from "lucide-react";

interface SidebarProps {
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onAddNode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onImport, onExport, onAddNode }) => {
  return (
    <div className="absolute left-4 top-4 bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold mb-4">Prompt Tree Manager</h2>
      <div className="space-y-2">
        <label className="flex items-center gap-2 p-2 bg-blue-50 rounded cursor-pointer hover:bg-blue-100">
          <FileUp className="w-5 h-5" />
          <span>Import YAML</span>
          <input
            type="file"
            accept=".yaml,.yml"
            onChange={onImport}
            className="hidden"
          />
        </label>
        <button
          onClick={onExport}
          className="flex items-center gap-2 p-2 bg-green-50 rounded w-full hover:bg-green-100"
        >
          <FileDown className="w-5 h-5" />
          <span>Export YAML</span>
        </button>
        <button
          onClick={onAddNode}
          className="flex items-center gap-2 p-2 bg-purple-50 rounded w-full hover:bg-purple-100"
        >
          <Plus className="w-5 h-5" />
          <span>Add Node</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
