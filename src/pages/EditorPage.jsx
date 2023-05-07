import { useContext, useEffect, useState } from 'react';

import { GlobalContext } from '../context/GlobalState';

import { useD3 } from '../hooks/useD3';
import * as d3 from 'd3';

import { automaton } from '../models/automata';


const generateDFA = () => {
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
    // return autoOne.serialize();
}

function DrawGraph() {
    
    let jsonDFA = generateDFA() 
    console.log(jsonDFA);

    const ref = useD3((svg) => {
        svg.attr("width", "100%")
            .attr("height", "100%")
            .style("border", "1px solid black");
        const radius = 40;
        const height = 500;
        const width = 400;

        const node_group = svg.selectAll("g")
            .data(jsonDFA.listOfNodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("id", d => d.nodeID)
            .attr("transform", d => `translate(${100},${d.cy})`);

        node_group.append("circle")
            .attr("r", radius)
            .attr("id", d => d.nodeID)
            .attr("fill", d => {
                if ( d.identity === 1) {// starting state
                

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

        }


       /* 

        // working draggable nodes that update data structure
        const nodes = svg.selectAll("circle")
            .data(jsonDFA.listOfNodes)
            .enter()
            .append('circle')
            .attr("id", d => d.nodeID)
            .attr("cx", d => d.cx)
            .attr("cy", d => d.cy)
            .attr("r", radius)
            .attr("fill", d => {
                switch (d.identity) {
                    case 0: // non-terminal 
                        return "orange";
                    case 1: // starting state
                        return "blue";
                    case 2: // terminal state
                        return "green";
                }
            })          
            .call(d3.drag().on("drag", (event, d) => {
                d3.selectAll(`circle[id='${d.nodeID}']`)
                    .attr("cx", event.x + event.dx)
                    .attr("cy", event.y + event.dy);
            }))
        */    

    }, [jsonDFA]);

    return (
        <svg ref={ref} style={{ height: '95vh', width: '95vw'}} ></svg>
    );
}

export default function Editor() {

    const { activeProject } = useContext(GlobalContext);
    const [ projectName, setProjectName ] = useState('');

    useEffect(() => {
        setProjectName(activeProject.meta.projectname);
        console.log(`showing editor for project: ${activeProject.meta.projectname}`);
    }, []);

    if (activeProject === '' || activeProject === undefined ) {
        console.log('FROM EDITOR -> no project selected');
            
    }

    return (
        <DrawGraph />
    )
}
