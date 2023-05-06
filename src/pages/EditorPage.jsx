import { useContext, useEffect, useState } from 'react';

import { GlobalContext } from '../context/GlobalState';

import { useD3 } from '../hooks/useD3';
import * as d3 from 'd3';

function DrawGraph() {

    const [dfa, setDfa] = useState({});
    const ref = useD3(
        (svg) => {
            const margin = {
                top: 10,
                right: 30,
                bottom: 30,
                left: 40,
            };
            const width = 400 -margin.left - margin.bottom;
            const height = 400 - margin.top - margin.bottom;


            svg.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const data = {
                nodes: [{id: 0, name: "q0"}, {id: 1, name: "q1"}, {id: 2, name: "q2"}],
                edges: [{source: 0, target: 1}, {source: 1, taget: 2}, {source: 0, taget: 2}],
            };

            let edge = svg.selectAll("line")
                    .data(data.edges)
                    .enter()
                    .append("line")
                    .style("stroke", "steelblue")
                    .style("width", 100)
                    .style("stroke-width", 3);

            let node = svg.selectAll("circle")
                    .data(data.nodes)
                    .enter()
                    .append("circle")
                    .attr("r", 10)
                    .style("fill", "green");

            var simulation = d3.forceSimulation(data.nodes)
                .force("link", d3.forceLink()
                    .id( d => d.id )
                    .links(data.edges)
                )
                .force("radius", d3.forceRadial((width/3)))
                .on("end", () => {
                    edge.attr("x1", (d) => d.source.x+10 )
                        .attr("y1", (d) => d.source.y-10 )
                        .attr("x2", (d) => d.source.x+10 )
                        .attr("y2", (d) => d.source.y-10 )
                    node.attr("cx", (d) => d.x+10 )
                        .attr("cy", (d) => d.y-10 )
                });

        },[]
    );


    return (
        <svg ref={ref}/>
    )

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
