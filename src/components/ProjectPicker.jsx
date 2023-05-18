import { useContext, useEffect, useState } from 'react';
import { Stack, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getProjects, openProject } from '../services/filesystem_ops';

import { GlobalContext } from '../context/GlobalState';

import '../styles/ProjectPicker.css';

import { automaton } from '../models/automata';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export default function ProjectPicker() {
    const [projects, setProjects] = useState([]);

    const { setActiveProject, setActiveView, setStateMachine } = useContext(GlobalContext);

    useEffect(() => {
        // retrive list of project files from the filesystem
        getProjects().then( (data) => {
            console.log(data);
            setProjects(data);
        })
    }, [])

    const handleSelect = (event) => {
        // open project from path
        openProject(event.target.value)
            .then( data => {
                console.log('from project picker', data)
                setActiveProject(data);
                // convert to internal ds
                setStateMachine(data);
                setActiveView('editor'); // switch view to editor        
            }).catch( error => {
                console.log(error);
            });

    }

    if (projects.length < 1) {
        // redirect to 
        console.log('no projects... redirecting to create project view'); 
    }

    return (
        <div className='projects-list-container'>
            <h1>Projects</h1>
            <Stack spacing={2}>
                {projects.map((project) => (
                    <Item key={project.name+project.path}>
                        {project.name}
                        <Button 
                        onClick={handleSelect} value={project.name}>Open</Button>
                        <br/>
                        {/* PATH: {project.path} */}
                    </Item>
                ))}
            </Stack>
        </div>
    )
}
