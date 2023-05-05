import { Handle, Position, useStore } from 'reactflow';

const connectionNodeIdSelector = (state) => state.connectionNodeId;

export default function AcceptNode({ id, isConnectable }) {
    const connectionNodeId = useStore(connectionNodeIdSelector);
    const isTarget = connectionNodeId && connectionNodeId !== id;

    const targetHandleStyle = { zIndex: isTarget ? 3 : 1 };


    return (
        <div className="customNode">
            <div
                className="customNodeBody"
                style={{
                    borderStyle: "double",
                    backgroundColor: isTarget ? '#ffcce3' : '#ccd9f6',
                    borderRadius: '100%',
                    width: '5vh',
                    height: '5vh'
                }}
            >
                <Handle
                    className="targetHandle"
                    style={{ zIndex: 2 }}
                    position={Position.Right}
                    type="source"
                    isConnectable={isConnectable}
                />
                <Handle
                    className="targetHandle"
                    style={targetHandleStyle}
                    position={Position.Left}
                    type="target"
                    isConnectable={isConnectable}
                />
                {`q${id}`}
            </div>
        </div>
    );
}
