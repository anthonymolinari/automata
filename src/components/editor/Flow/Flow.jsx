import React, { useCallback } from "react";
import ReactFlow, {
    addEdge,
    useReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ReactFlowProvider
} from "reactflow";
import "reactflow/dist/style.css";
import {ControlButton} from "reactflow";

import AcceptNode from "./AcceptNode.jsx";


let nodeId = 0
const onInit = (reactFlowInstance) =>
    console.log("flow loaded:", reactFlowInstance);

const OverviewFlow = () => {
    const reactFlowInstance = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );
    const nodeID = 0;

    const nodeTypes = {
        accept: AcceptNode,

    };

    const onClick = useCallback((type) => {
        const id = `${nodeId++}`;
        const newNode = {
            id,
            type: "accept",
            position: {
                x: Math.random() * 500,
                y: Math.random() * 500,
            },
            data: {
                label: `Node ${id}`,
            },


        };
        reactFlowInstance.addNodes(newNode);
    }, []);



    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onConnect={onConnect}
            onInit={onInit}
            fitView
            attributionPosition="top-right"
        >
            <MiniMap
                nodeStrokeColor={(n) => {
                    if (n.style?.background) return n.style.background;
                    if (n.type === "input") return "#0041d0";
                    if (n.type === "output") return "#ff0072";
                    if (n.type === "default") return "#1a192b";
                    return "#eee";
                }}
                nodeColor={(n) => {
                    if (n.style?.background) return n.style.background;

                    return "#fff";
                }}
                nodeBorderRadius={2}
            />
            <Controls >
                <ControlButton onClick={() => onClick("")} title="action">
                    <div>add</div>
                </ControlButton>
                <ControlButton onClick={() => onClick()} title="action">
                    <div>add2</div>
                </ControlButton>
            </Controls>
            <Background color="#aaa" gap={16} />

        </ReactFlow>

    );
};

export default function () {
    return (
        <ReactFlowProvider>
            <OverviewFlow />
        </ReactFlowProvider>
    );
}
