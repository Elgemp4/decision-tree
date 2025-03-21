import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  EdgeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { parse, stringify } from "yaml";
import CustomNode from "./components/Chart/CustomNode";
import Sidebar from "./components/Sidebar";
import NodeModal from "./components/NodeModal";
import { loadFunctionConfig } from "./utils/config";
import type { YAMLData } from "./types";
import type { FunctionConfig } from "./utils/config";

import CustomEdge from "./components/Chart/CustomEdge";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const defaultEdgeOptions = {
  type: "custom",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  style: {
    strokeWidth: 2,
    maxWidth: "100px",
    color: "green",
  },
};

interface NodeWithLevel {
  id: string;
  level: number;
  children: string[];
}

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [functionConfig, setFunctionConfig] = useState<FunctionConfig | null>(
    null
  );
  console.log(edges);
  useEffect(() => {
    loadFunctionConfig().then((result) => {
      setFunctionConfig(result);
      console.log(result);
    });
  }, []);

  const calculateNodeLevels = (
    initialStep: string,
    script: YAMLData["script"]
  ): NodeWithLevel[] => {
    const result: NodeWithLevel[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string, level: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = script[nodeId];
      const children =
        node?.links?.map((link) => link.next_step).filter(Boolean) || [];

      result.push({ id: nodeId, level, children });
      children.forEach((childId) => traverse(childId, level + 1));
    };

    traverse(initialStep, 0);

    Object.keys(script).forEach((nodeId) => {
      if (!visited.has(nodeId)) {
        traverse(nodeId, 0);
      }
    });

    return result;
  };

  const layoutNodes = (
    nodeData: NodeWithLevel[],
    script: YAMLData["script"]
  ): Node[] => {
    const LEVEL_HEIGHT = 300;
    const LEVEL_WIDTH = 700;

    const levelCounts = new Map<number, number>();
    nodeData.forEach((node) => {
      levelCounts.set(node.level, (levelCounts.get(node.level) || 0) + 1);
    });

    return nodeData.map((node) => {
      const levelCount = levelCounts.get(node.level) || 1;
      const nodesAtLevel = nodeData.filter((n) => n.level === node.level);
      const nodeIndexAtLevel = nodesAtLevel.findIndex((n) => n.id === node.id);

      const x = (nodeIndexAtLevel - (levelCount - 1) / 2) * LEVEL_WIDTH;
      const y = node.level * LEVEL_HEIGHT;
      console.log(node.id);
      console.log(script);
      const scriptNode = script[node.id];
      const allowedFunctions = scriptNode.allowed_functions
        ? Object.entries(scriptNode.allowed_functions).map(
            ([key, value]) => `${key}: ${value}`
          )
        : [];

      console.log("Allo ?");
      return {
        id: node.id,
        type: "custom",
        position: { x, y },
        data: {
          title: node.id,
          prompt: scriptNode.prompt || "",
          useSTT: scriptNode.use_stt || false,
          allowedFunctions,
          onEdit: () => handleNodeEdit(node.id),
          onDelete: () => handleNodeDelete(node.id),
        },
      };
    });
  };

  const handleNodeDelete = (nodeId: string) => {
    if (window.confirm("Are you sure you want to delete this node?")) {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        data: {
          label: "",
        },
        type: "custom",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleNodeEdit = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const handleModalClose = () => {
    setSelectedNode(null);
  };

  const handleNodeUpdate = (data: {
    title: string;
    prompt: string;
    useSTT: boolean;
    allowedFunctions: string[];
  }) => {
    setNodes((nds) => {
      return nds.map((node) =>
        node.id === selectedNode
          ? {
              ...node,
              data: {
                ...data,
                onEdit: () => handleNodeEdit(node.id),
                onDelete: () => handleNodeDelete(node.id),
              },
            }
          : node
      );
    });
  };

  const handleEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    const newCondition = window.prompt(
      "Enter condition for this transition:",
      edge.label?.toString() || ""
    );
    if (newCondition !== null) {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edge.id ? { ...e, data: { label: newCondition } } : e
        )
      );
    }
  };

  const handleEdgeContextMenu = (event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    if (window.confirm("Are you sure you want to delete this connection?")) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const yamlContent = event.target?.result as string;
        const data = parse(yamlContent) as YAMLData;

        if (data.system_prompt) {
          setSystemPrompt(data.system_prompt);
        }

        const nodeWithLevels = calculateNodeLevels(
          data.initial_step,
          data.script
        );
        const newNodes = layoutNodes(nodeWithLevels, data.script);
        const newEdges: Edge[] = [];

        Object.entries(data.script).forEach(([id, node]) => {
          node.links?.forEach((link, linkIndex) => {
            if (link.next_step) {
              newEdges.push({
                id: `${id}-${link.next_step}-${linkIndex}`,
                source: id,
                target: link.next_step,
                data: { label: link.condition || "" },
                type: "custom",
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
              });
            }
          });
        });

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        console.error("Error parsing YAML:", error);
        alert("Invalid YAML file");
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const yamlData: YAMLData = {
      system_prompt: systemPrompt,
      initial_step: nodes[0]?.id || "",
      script: {},
    };

    nodes.forEach((node) => {
      const nodeEdges = edges.filter((edge) => edge.source === node.id);
      const allowedFunctions: Record<string, string> = {};

      node.data.allowedFunctions.forEach((func: string) => {
        const [key, value] = func.split(":").map((s) => s.trim());
        if (value) {
          allowedFunctions[key] = value;
        }
      });
      console.log(node.data.title);
      yamlData.script[node.data.title] = {
        prompt: node.data.prompt,
        allowed_functions:
          Object.keys(allowedFunctions).length > 0
            ? allowedFunctions
            : undefined,
        use_stt: node.data.useSTT,
        links: nodeEdges.map((edge) => {
          return {
            next_step: nodes.find((node) => node.id == edge.target)?.data.title,
            condition: edge.data?.label,
          };
        }),
      };
    });

    const yamlString = stringify(yamlData);
    const blob = new Blob([yamlString], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt-tree.yaml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddNode = () => {
    const newId = `node-${nodes.length + 1}`;
    const newNode: Node = {
      id: newId,
      type: "custom",
      position: { x: 100, y: 100 },
      data: {
        title: `Node ${nodes.length + 1}`,
        prompt: "New prompt",
        useSTT: false,
        allowedFunctions: [],
        onEdit: () => handleNodeEdit(newId),
        onDelete: () => handleNodeDelete(newId),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const selectedNodeData = selectedNode
    ? nodes.find((n) => n.id === selectedNode)?.data
    : null;

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={handleEdgeClick}
        edgeTypes={edgeTypes}
        onEdgeContextMenu={handleEdgeContextMenu}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <Sidebar
        onImport={handleImport}
        onExport={handleExport}
        onAddNode={handleAddNode}
      />
      {selectedNodeData && (
        <NodeModal
          isOpen={true}
          onClose={handleModalClose}
          data={selectedNodeData}
          onSave={handleNodeUpdate}
          functionConfig={functionConfig}
        />
      )}
    </div>
  );
}

export default App;
