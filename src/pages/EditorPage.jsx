import { useContext, useEffect, useState } from 'react';
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

    const { stateMachine } = useContext(GlobalContext);
    const [ open, setOpen ] = useState(false);
    const radius = 40;

    const ref = useD3((svg) => {
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
        
        const edge_group = svg.selectAll("path.edge")
            .data(stateMachine.connectionList)
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
            .attr("class", "edge")
            .attr("stroke", "black")
            .attr("fill", "none")
            .attr("stroke-width", "2")
            .attr("marker-end", `url(#arrow)`)
            .attr("d",(d) => DrawEdge(d));

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

            console.log(stateMachine);
        }


    }, [stateMachine, doUpdate]);
    
    const DrawEdge = (d) => {
            const      targetCx = stateMachine.listOfNodes[d.destination].cx
            const      targetCy = stateMachine.listOfNodes[d.destination].cy
            const      sourceCx = stateMachine.listOfNodes[d.origin].cx
            const      sourceCy = stateMachine.listOfNodes[d.origin].cy

            if(d.origin !== d.destination) {
                const xDiff = sourceCx - targetCx
                const yDiff = sourceCy - targetCy
                const xFraction = Math.sign(xDiff) * Math.sqrt(Math.abs(xDiff) / (Math.abs(xDiff) + Math.abs(yDiff)) * Math.pow(radius, 2) + ((1 / 10) * Math.pow(radius, 2)))
                const yFraction = Math.sign(yDiff) * Math.sqrt(Math.abs(yDiff) / (Math.abs(xDiff) + Math.abs(yDiff)) * Math.pow(radius, 2) - ((1 / 10) * Math.pow(radius, 2)))
                const sourcePointX = sourceCx - xFraction
                const sourcePointY = sourceCy - yFraction
                const targetPointX = targetCx + xFraction
                const targetPointY = targetCy + yFraction
                const newXDiff = sourcePointX - targetPointX
                const newYDiff = sourcePointY - targetPointY
                const firstThirdX = newXDiff / 10
                const firstThirdY = newYDiff / 10
                const firstPointX = sourcePointX - firstThirdY
                const firstPointY = sourcePointY + firstThirdX
                const secondPointX = targetPointX - firstThirdY
                const secondPointY = targetPointY + firstThirdX

                return `M ${sourcePointX} ${sourcePointY} 
                   C  ${firstPointX} ${firstPointY}, ${secondPointX} ${secondPointY}, ${targetPointX} ${targetPointY}`
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

    function addNode() { 
        let newNodeId = stateMachine.addNode(200, 200);
        stateMachine.updateIdentity(newNodeId,0);
        console.log("added new node", newNodeId);
        setDoUpdate(!doUpdate);
    }

    function saveChanges(event) {
        event.preventDefaults();


    }
    
    function updateTransistion() {

    }

    const handleOpen = () => {
        setOpen(true);
        setDoUpdate(!doUpdate);
    };

    const handleClose = () => {
        setOpen(false);
        setDoUpdate(!doUpdate);
    }

    return (
        <>
        <div className="editor-container">
            <div className="editor-toolbar">
                <Button variant="outlined" onClick={addNode}>+ node</Button>
                <Button variant="outlined" ></Button>
                <Button onClick={handleOpen}>+/- transistions</Button>
                <Button>test</Button>
                <Button>Convert</Button>
            </div>
            <svg ref={ref} style={{ height: '90vh', width: '90vw'}} ></svg>
        </div>
        <div> 
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Transistions</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Add, remove, & edit transistions
                    </DialogContentText>
                    <ul>
                        {stateMachine.connectionList.map((edge) => (
                            <li>
                                <span>from: {edge.origin}, to: {edge.destination}, on: {edge.parameter}</span><Button>Remove</Button>
                            </li>
                        ))}
                    </ul>
                    <Select label="From">
                        <MenuItem value={0}>{`q${0}`}</MenuItem>
                    </Select>
                    <TextField variant="outlined"/>
                    <Select label="From">
                        <MenuItem value={0}>{`q${0}`}</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                    <Button onClick={updateTransistion}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
        </>
    );
}

export default function Editor() {

    const { activeProject, setStateMachine, stateMachine } = useContext(GlobalContext);  
    
    useEffect(() => {
        console.log(`showing editor for project: ${activeProject.meta.projectname}`);
        setStateMachine(generateDFA()); // get automaton ds
    }, [activeProject]);

    if (activeProject === '' || activeProject === undefined ) {
        console.log('FROM EDITOR -> no project selected');
        return (<span>loading..</span>);    
    }

    return (
        <DrawGraph />
    )
}
