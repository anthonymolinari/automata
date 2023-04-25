import { useContext, useEffect, useState } from 'react';
import { Stack, Box, Paper, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getProjects, openProject } from '../services/filesystem_ops';

import { GlobalContext } from '../context/GlobalState';

import '../styles/ProjectPicker.css';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export default function ProjectPicker(props) {
    const [projects, setProjects] = useState([]);

    const { setActiveProject } = useContext(GlobalContext);
    
    useEffect(() => {
        // retrive list of project files from the filesystem
        getProjects().then( (data) => {
            setProjects(data);
        })
    }, [])

    const handleSelect = (event) => {
        event.preventDefault();
        console.log(event.target.value);
        // open project from path
        const project_json = openProject(event.target.value);
    
        // parse to automata object
        // ** need a jsonLoads method? **

        // that that automata object and add to global state
        setActiveProject(project_json);
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
                        PATH: {project.path}
                    </Item>
                ))}
            </Stack>
        </div>
    )
}