import { type FC } from "react";
import {
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  type EdgeProps,
  type Edge,
} from "reactflow";

const CustomEdge: FC<EdgeProps<Edge<{ label: string }>>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  console.log(data?.label);
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="absolute max-w-64 bg-white text-black border-gray-200 border-2 rounded-md text-sm p-2 nodrag nopan"
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
