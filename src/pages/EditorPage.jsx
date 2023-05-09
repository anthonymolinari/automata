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

    console.log("unparsed", autoOne);
    return autoOne;
}

function DrawGraph() {
    const [ doUpdate, setDoUpdate ] = useState(false);

    const { stateMachine } = useContext(GlobalContext);
    const [ open, setOpen ] = useState(false);

    const ref = useD3((svg) => {
        svg.attr("width", "100%")
            .attr("height", "100%")
            .style("border", "1px solid black");
        const radius = 40;

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
                if ( d.identity === 1) {// starting state
                    d3.select(`g[id='${d.nodeID}'`)
                        .append("polygon")
                    return 'blue'; 
                }
                if ( d.identity === 2) { // terminal
                    d3.select(`g[id='${d.nodeID}'`)
                        .append("circle")
                        .attr("stroke", "black")
                        .attr("stroke-width", 2)
                        .attr("r", radius-10)
                        .attr("fill", "transparent");
                    return 'green'; 
                }
                return 'orange'; // else non-terminal
            })
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("pointer-events", "none");

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
            console.log(event);
            d3.selectAll(`g[id='${d.nodeID}']`)
                .attr("transform", `translate(${event.sourceEvent.x},${event.sourceEvent.y})`);
            // update x,y in dfa
        }


    }, [stateMachine, doUpdate]);

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
                <Button onClick={addNode}>+ node</Button>
                <Button onClick={handleOpen}>+/- transistions</Button>
            </div>
            <svg ref={ref} style={{ height: '95vh', width: '95vw'}} ></svg>
        </div>
        <div> 
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Transistions</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Add, remove, & edit transistions
                    </DialogContentText>
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
        setStateMachine(generateDFA());
    }, [activeProject]);

    if (activeProject === '' || activeProject === undefined ) {
        console.log('FROM EDITOR -> no project selected');
        return (<span>loading..</span>);    
    }

    return (
        <DrawGraph />
    )
}
