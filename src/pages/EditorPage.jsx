import { useContext, useEffect, useState } from 'react';

import { GlobalContext } from '../context/GlobalState';

// place holder for project editor



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
        <h1>Editing: {projectName} </h1>
    )
}
