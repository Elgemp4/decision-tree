import React, { useState } from "react";
import { X, Plus, Trash } from "lucide-react";
import type { FunctionConfig } from "../utils/config";

interface FunctionPair {
  key: string;
  value: string;
}

interface NodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    title: string;
    prompt: string;
    useSTT: boolean;
    allowedFunctions: string[];
  };
  onSave: (data: {
    title: string;
    prompt: string;
    useSTT: boolean;
    allowedFunctions: string[];
  }) => void;
  functionConfig: FunctionConfig | null;
}

const NodeModal: React.FC<NodeModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  functionConfig,
}) => {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    prompt: data?.prompt || "",
    useSTT: data?.useSTT || false,
    allowedFunctions: [],
  });

  const initialFunctionPairs = () => {
    if (!data?.allowedFunctions || !Array.isArray(data.allowedFunctions)) {
      return [];
    }
    return data.allowedFunctions.map((func) => {
      const [key, value] = (func || "").split(":").map((s) => s?.trim() || "");
      return { key: key || func || "", value: value || "" };
    });
  };

  const [functionPairs, setFunctionPairs] = useState<FunctionPair[]>(
    initialFunctionPairs()
  );

  if (!isOpen) return null;

  const handleAddFunction = () => {
    setFunctionPairs([...functionPairs, { key: "", value: "" }]);
  };

  const handleRemoveFunction = (index: number) => {
    const newPairs = functionPairs.filter((_, i) => i !== index);
    setFunctionPairs(newPairs);
  };

  const handleFunctionChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newPairs = [...functionPairs];
    newPairs[index][field] = value;
    setFunctionPairs(newPairs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allowedFunctions = functionPairs
      .filter((pair) => pair.key.trim())
      .map((pair) => (pair.value ? `${pair.key}: ${pair.value}` : pair.key));

    onSave({
      ...formData,
      allowedFunctions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Node</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Name
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Instructions
              </label>
              <textarea
                value={formData.prompt}
                onChange={(e) =>
                  setFormData({ ...formData, prompt: e.target.value })
                }
                rows={12}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.useSTT}
                  onChange={(e) =>
                    setFormData({ ...formData, useSTT: e.target.checked })
                  }
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Use STT
                </span>
              </label>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Allowed Functions
                </label>
                <button
                  type="button"
                  onClick={handleAddFunction}
                  className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  Add Function
                </button>
              </div>
              <div className="space-y-2">
                {functionPairs.map((pair, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <select
                      value={pair.key}
                      onChange={(e) =>
                        handleFunctionChange(index, "key", e.target.value)
                      }
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a function</option>
                      {functionConfig &&
                        Object.entries(functionConfig.allowed_functions).map(
                          ([key, value]) => (
                            <option key={key} value={key}>
                              {key} ({value})
                            </option>
                          )
                        )}
                    </select>
                    <input
                      type="text"
                      value={pair.value}
                      onChange={(e) =>
                        handleFunctionChange(index, "value", e.target.value)
                      }
                      placeholder="Parameters (optional)"
                      className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFunction(index)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeModal;
