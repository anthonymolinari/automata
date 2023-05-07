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
    
    return autoOne.serialize();
}

function DrawGraph() {
    
    let jsonDFA = JSON.parse(generateDFA());
    console.log(jsonDFA);

    const ref = useD3((svg) => {
        svg.attr("width", "100%")
            .attr("height", "100%")
            .style("border", "1px solid black");
        const radius = 30;

        const nodes = svg.selectAll("circle")
            .data(jsonDFA.listOfNodes)
            .enter()
            .append('circle')
            .attr("id", d => d.nodeID)
            .attr("cx", d => d.cx)
            .attr("cy", d => d.cy)
            .attr("r", radius)
            .attr("fill", "orange")
            .call(d3.drag().on("drag", (event, d) => {
                d3.selectAll(`circle[id='${d.nodeID}']`)
                    .attr("cx", event.x + event.dx)
                    .attr("cy", event.y + event.dy);
            }));
        
        

    }, [jsonDFA]);

    return (
        <svg ref={ref} style={{ height: '90vh', width: '90vw'}} ></svg>
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
