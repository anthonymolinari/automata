/*

    the is the page view for creating a new project

    notes:
        - default project directory is is Documents
        on windows and linux

    todo:
        - load base path from config file
        - rewrite using material UI
*/

import { useState, useEffect } from 'react';

import { TextField, Button, Paper, Box, Typography } from '@mui/material';

import { confirm, message } from '@tauri-apps/api/dialog';
import { documentDir } from '@tauri-apps/api/path';

import { createNewProjectFiles } from '../services/filesystem_ops';
import styled from '@emotion/styled';


const Item = styled(Paper)(({ theme }) => ({
    // ...theme.typography.body2,
    textAlign: 'center',
    // color: theme.palette.text.secondary,
    height: '100%',
    lineHeight: '60px',
}));


export default function CreateProjectPage(props) {
    const [basePath, setBasePath] = useState("");
    const projectsDir = 'AutomataProjects'; // load from config later
    const [projectName, setProjectName] = useState('untiled');

    useEffect(() => {
        documentDir().then( (path) => {
            setBasePath(path);
        }, (error) => {
            console.log(error);
        })
    },[])
    
    const handleChange = (event) => {
        setProjectName(event.target.value);
    }

    const handleSubmit = async () => {
        const confirmed = await confirm(`Create Project: ${projectName}`, {
            title: 'New Project Confirmation',
            type: 'info'
        });
        if (!confirmed) {
            console.log('abandoned project creation');
            return;
        }

        console.log('creating project...')
        const success = await createNewProjectFiles(projectName, projectsDir);
        if (!success) {
            message('A project by that name already exists', {
                title: 'Error',
                type: 'error'
            });
        }
    }

    return (
        <div>
            <Box sx={{ height: '100%' }}>
                <Item key="create-project-container" elevation={16}>
                    <Typography variant="h4" component="h1">
                        Project Creation
                    </Typography>
                    <TextField id="project-name-input" value={projectName} onChange={handleChange} variant="filled"/>
                    <Typography variant='subtitle' component="h4">
                        {basePath}{projectsDir}/{projectName}.json
                    </Typography>
                    <Button onClick={handleSubmit} variant="contained">Create</Button>
                </Item>
            </Box>
        </div>
    )

}