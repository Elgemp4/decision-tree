import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Mic, MicOff, Trash } from "lucide-react";

interface CustomNodeData {
  title: string;
  prompt: string;
  useSTT: boolean;
  allowedFunctions: string[];
  onEdit: () => void;
  onDelete: () => void;
}

const CustomNode = ({
  data,
  isConnectable,
  selected,
}: NodeProps<CustomNodeData>) => {
  return (
    <div
      className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[300px] ${
        selected ? "border-blue-500" : "border-gray-200"
      }`}
      onDoubleClick={data.onEdit}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-sm">{data.title}</div>
        <div className="flex items-center gap-2">
          {data.useSTT ? (
            <Mic className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <MicOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete();
            }}
            className="p-1 hover:bg-red-100 rounded text-red-500"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
      {data.allowedFunctions.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          <div className="font-semibold">Allowed Functions:</div>
          <div className="flex flex-col flex-wrap gap-1 mt-1">
            {data.allowedFunctions.map((func, index) => (
              <span key={index} className="bg-gray-100 px-2 py-1 rounded-full">
                {func}
              </span>
            ))}
          </div>
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(CustomNode);
