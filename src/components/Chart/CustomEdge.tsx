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
  source,
  target,
  data,
}) => {
  let edgePath;
  let labelX;
  let labelY;
  if (source !== target) {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  } else {
    const radiusX = 150;
    const radiusY = (sourceY - targetY) * 0.6;
    edgePath = `M ${sourceX} ${
      sourceY - 5
    } A ${radiusX} ${radiusY} 0 1 0 ${targetX} ${targetY + 5}`;

    labelX = sourceX + radiusX * 1.6;
    labelY = sourceY + (targetY - sourceY) * 0.5;
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd="arrowclosed" />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="absolute max-w-64 text-center bg-white text-black border-gray-200 border-2 rounded-md text-sm p-2 nodrag nopan"
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
