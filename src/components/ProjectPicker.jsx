import { useEffect, useState } from 'react';
import { Stack, Box, Paper, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getProjects } from '../services/filesystem_ops';

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
    
    useEffect(() => {
        // retrive list of project files from the filesystem
        getProjects().then( (data) => {
            setProjects(data);
        })
    }, [])

    const handleSelect = (event) => {
        event.preventDefault();

        console.log(event.target.value);
    }

    return (
        <div className='projects-list-container'>
            <h1>Projects</h1>
            <Stack spacing={2}>
                {projects.map((project) => (
                    <Item key={project.name+project.path}>
                        {project.name}
                        <Button onClick={handleSelect} value={project.name}>Open</Button>
                        <br/>
                        PATH: {project.path}
                    </Item>
                ))}
            </Stack>
        </div>
    )
}