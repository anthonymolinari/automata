import { useContext, useEffect, useState, useRef } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, MenuItem, Select } from '@mui/material';

import { GlobalContext } from '../context/GlobalState';

import { useD3 } from '../hooks/useD3';
import * as d3 from 'd3';

import { automaton } from '../models/automata';

function generateDFA() {
    //Testing
    const autoOne = new automaton("Test 1") //Dummy Name   
    //Test DFA structure (its also an NFA by virtue)
    // ->0 <--> 1
    //   |      |
    //  *2 <-> *3
    //Create the top nodes
    autoOne.addNode(213, 217)
    autoOne.updateIdentity(0, 1)
    autoOne.addNode(433, 417)
    //Link them together
    autoOne.updateLink(0, 1, 'a', 1)
    autoOne.updateLink(1, 0, 'a', 1)
    //create the bottom nodes
    autoOne.addNode(113, 137)
    autoOne.updateIdentity(2, 2)
    autoOne.addNode(233, 237)
    autoOne.updateIdentity(3, 2)
    //Link the bottom nodes together
    autoOne.updateLink(2, 2, 'b', 1)
    autoOne.updateLink(3, 3, 'b', 1)
    autoOne.updateLink(3, 2, 'a', 1)
    autoOne.updateLink(2, 3, 'a', 1)
    //Link the top nodes to the bottom nodes
    autoOne.updateLink(0, 2, 'b', 1)
    autoOne.updateLink(1, 3, 'b', 1)

    console.log("stateMachine: ", autoOne);
    return autoOne;
}


function DrawGraph() {
    const [ doUpdate, setDoUpdate ] = useState(false); 
    const [ renderedEdges, setRenderedEdges ] = useState([]);

    const { stateMachine, setStateMachine } = useContext(GlobalContext);
    const radius = 40;
    let ref = useRef();

    function renderD3() {
        let svg = d3.select(ref.current); 

        let c_edges = concatenateEdges(stateMachine.connectionList);
 
        svg.attr("width", "100%")
            .attr("height", "100%")
            .style("border", "1px solid black"); 
        

        svg.append("defs")
            .append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", "5")
            .attr("refY", "5")
            .attr("markerWidth","6")
            .attr("markerHeight", "6")
            .attr("orient", "auto")
            .append("path")
            .attr("d","M 0 0 L 10 5 L 0 10 z");

        const label_group = svg.selectAll("text.edge")
            .data(c_edges)
            .enter()

        label_group
            .append("text")
            .attr("rotate","180deg")
            .attr("dy", -5)
            .attr("text-anchor", "middle")
            .append("textPath")
            .attr("href",(d,i) => `#labelPath${i}`)
            .attr("startOffset", "50%")
            .text(d => d.parameter);
        
        const edge_group = svg.selectAll("path.edge")
            .data(c_edges)
            .enter()
        
        const node_group = svg.selectAll("g")
            .data(stateMachine.listOfNodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("id", d => d.nodeID)
            .attr("transform", d => `translate(${d.cx},${d.cy})`);
     

        node_group.append("circle")
            .attr("r", radius)
            .attr("id", d => d.nodeID)
            .attr("fill", d => {
                if ( d.identity === 1) { // starting state
                    d3.select(`g[id='${d.nodeID}'`)
                        .append("polygon")
                    return 'blue'; 
                }
                if ( d.identity === 2) { // terminal
                    d3.select(`g[id='${d.nodeID}'`)
                        .append("circle")
                        .attr("stroke", "black")
                        .attr("stroke-width", 2)
                        .attr("r", radius-7)
                        .attr("fill", "transparent");
                    return 'green'; 
                }
                return 'grey'; // else non-terminal
            })
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("pointer-events", "none");

        edge_group.append("path")
            .attr("id",(_,i) => `labelPath${i}`)
            .attr("class", "edge")
            .attr("stroke", "black")
            .attr("fill", "none")
            .attr("stroke-width", "2")
            .attr("marker-end", `url(#arrow)`)
            .attr("d",(d) => DrawEdge(d))
            .append("text")
            .text( d => d.parameter)
            .attr("text-anchor", "middle");
            
            
        node_group.append("text")
            .text( d => `q${d.nodeID}`)
            .attr("text-anchor", "middle")


        node_group.append("rect")
            .attr("width", radius*2)
            .attr("height", radius*2)
            .attr("x", -1 * radius)
            .attr("y", -1 * radius)
            .attr("fill", "transparent")
            .attr("pointer-event", "all")
            .call(d3.drag().on("drag", dragUpdate));

        function dragUpdate(event, d) {
            d3.selectAll(`g[id='${d.nodeID}']`)
                .attr("transform", `translate(${event.sourceEvent.x},${event.sourceEvent.y})`);
            // update x,y in dfa
            stateMachine.listOfNodes.forEach( (node) => {
                if (node.nodeID === d.nodeID) {
                    node.cy = event.sourceEvent.y;
                    node.cx = event.sourceEvent.x;
                }
            }); 
            d3.selectAll(`path[class='edge']`)
                .attr("d", DrawEdge);
        }
       
    }

    useEffect(() => {
        setRenderedEdges(concatenateEdges(stateMachine.connectionList));
        renderD3();
    }, [stateMachine, doUpdate]);
 
    const refresh = () => {
        d3.select("svg").selectAll("*").remove();
        setStateMachine(stateMachine);
        setRenderedEdges(concatenateEdges(stateMachine.connectionList));
        console.log(stateMachine);
        renderD3();
    };

  

    const DrawEdge = (d) => {
            const      targetCx = stateMachine.listOfNodes[d.destination].cx
            const      targetCy = stateMachine.listOfNodes[d.destination].cy
            const      sourceCx = stateMachine.listOfNodes[d.origin].cx
            const      sourceCy = stateMachine.listOfNodes[d.origin].cy

            if(d.origin !== d.destination) {
                let xDiff = sourceCx - targetCx
                let yDiff = sourceCy - targetCy
                const xFraction = Math.sign(xDiff) * Math.sqrt(Math.abs(xDiff) / (Math.abs(xDiff) + Math.abs(yDiff)) * Math.pow(radius, 2))
                const yFraction = Math.sign(yDiff) * Math.sqrt(Math.abs(yDiff) / (Math.abs(xDiff) + Math.abs(yDiff)) * Math.pow(radius, 2))
                const sourcePointX = sourceCx - xFraction
                const sourcePointY = sourceCy - yFraction
                const targetPointX = targetCx + xFraction
                const targetPointY = targetCy + yFraction
                const newXDiff = sourcePointX - targetPointX
                const newYDiff = sourcePointY - targetPointY
                const firstThirdX = newXDiff / 8
                const firstThirdY = newYDiff / 8
                const firstPointX = sourcePointX - firstThirdY
                const firstPointY = sourcePointY + firstThirdX
                const secondPointX = targetPointX - firstThirdY
                const secondPointY = targetPointY + firstThirdX

                const controlPointX = (firstPointX + secondPointX) / 2
                const controlPointY = (firstPointY + secondPointY) / 2

                return `M ${sourcePointX} ${sourcePointY} 
                   Q  ${controlPointX} ${controlPointY}, ${targetPointX} ${targetPointY}`
            }else{ 
                const leftXControl = sourceCx - radius - 70;
                const leftYControl = sourceCy - radius - 70;
                const rightXControl = sourceCx + radius + 70;
                const rightYControl = sourceCy - radius - 70;
                const startAndEndY = sourceCy - radius

                return `M ${sourceCx} ${startAndEndY} 
                   C  ${leftXControl} ${leftYControl}, ${rightXControl} ${rightYControl}, ${sourceCx} ${startAndEndY}`

            }
    }  

    const concatenateEdges = (data) => {
        let newData = [];
        let found = false;
        for(let i = 0;i < data.length; i++){
            console.log(i)
            for(let j = 0;j < newData.length;j++){
                if(data[i].origin == newData[j].origin && data[i].destination == newData[j].destination){
                    newData[j].parameter = newData[j].parameter + ',' + data[i].parameter
                    found = true;
                    console.log("made it")
                    break;
                }
            }
            if(found == false){
                newData.push(data[i])
            }
            found = false;
        }
        console.log(newData);
        return newData;
    }
    function debug() {
        console.log("debug", stateMachine);
    }

    function addNode() { 
        let newNodeId = stateMachine.addNode(200, 200);
        stateMachine.updateIdentity(newNodeId,0);
        setDoUpdate(!doUpdate);
    }
    function deleteNode(event) {
        let nodeID = parseInt(event.target.value);
        console.log('deleting node', nodeID);
        stateMachine.removeNode(nodeID);
    }

    function saveChanges(event) {
        event.preventDefaults();
        // take a snapshot of the project
        // and write it to disk
        console.log(stateMachine);
    }
    
    function createTransition(event) {
        event.preventDefault();
        //stateMachine.updateLink(edge.origin, edge.destination, edge.parameter, 1);
    }

    function deleteTransition(event) {
        event.preventDefault();
        let edge = JSON.parse(event.target.value);
        console.log(event.target.value);
        stateMachine.updateLink(edge.origin, edge.destination, edge.parameter, 2);
        setRenderedEdges(concatenateEdges(stateMachine.connectionList))
    }

    return (
        <>
        <div className="editor-container"> 
            <svg ref={ref} style={{ height: '98vh', width: '68vw'}} ></svg>
            <div className="testing-container" style={{ flex: 'inline-block', float: 'right', background: 'lightgrey', width: '30vw', overflowY: 'auto' }}>
                <h3>Edit State Machine</h3> 
                <div className="editor-toolbar" style={{ padding: '3px', margin: '5px' }}>
                    <button onClick={addNode}>+ node</button>
                    <button onClick={refresh}>refresh</button>
                </div>
                <span>Enter a string to test</span><br/>
                <input type='text' />
                <button>Test</button>
                <h3>Nodes</h3>
                <ul style={{ listStyle: 'none', paddingLeft: 0, marginLeft: 20 }}>
                    {stateMachine.listOfNodes.map((node, idx) => (
                        <li key={`${node.nodeID}-${idx}-li`} style={{ backgroundColor: (idx % 2 ? 'lightgrey' : 'white') }}>
                            <span key={`node-span-${idx}`} >q{node.nodeID}</span>
                            <Button key={`node-button-remove-${idx}`} onClick={deleteNode} value={node.nodeID}>remove</Button>
                        </li>
                    ))}
                </ul>
                <h3>Transitions</h3>
                <ul style={{ listStyle: 'none', paddingLeft: 0, marginLeft: 20 }}>
                    {stateMachine.connectionList.map((edge, idx) => (
                        <li key={`${edge}${idx}`}style={{ backgroundColor: (idx % 2 ? 'lightgrey' : 'white') }}>
                            <span key={`edge-span-${idx}`}>from: q{edge.origin}, to: q{edge.destination}, on: {edge.parameter}</span>
                            <Button key={`edge-button-remove-${idx}`} onClick={deleteTransition} value={JSON.stringify(edge)} >remove</Button>
                        </li>
                    ))}
                </ul>
                <h4>new transition</h4>
                <form onSubmit={createTransition}>
                    <label >from:</label>
                    <select id="from-node" name="from-node">
                        {stateMachine.listOfNodes.map((node) => (
                            <option key={`from-select-option-${node.nodeID}`}>{node.nodeID}</option>
                        ))}
                    </select>
                    <label >on:</label>
                    <input id="on-value"/>
                    <label >to:</label>
                    <select id="to-node" name="to-node">
                        {stateMachine.listOfNodes.map((node) => (
                            <option key={`to-select-option-${node.nodeID}`}>{node.nodeID}</option>
                        ))}
                    </select>
                    <input type="submit"/>
                </form>
            </div>
        </div>
        <div> 

        </div>
        </>
    );
}

function Renderer() {
    const { stateMachine } = useContext(GlobalContext);

    useEffect(() => {

    }, [stateMachine]);

    return (
        <DrawGraph/>
    )
}

export default function Editor() {

    const { activeProject, setStateMachine } = useContext(GlobalContext);  
 
    useEffect(() => {
        console.log(`showing editor for project: ${activeProject.meta.projectname}`);
        setStateMachine(generateDFA()); // get automaton ds
    }, [activeProject]);

    if (activeProject === '' || activeProject === undefined ) {
        console.log('FROM EDITOR -> no project selected');
        return (<span>loading..</span>);    
    }

    return (
        <Renderer />
    )
}
