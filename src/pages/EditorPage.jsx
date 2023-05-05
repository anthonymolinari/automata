import { useContext, useEffect, useState } from 'react';

//import { GlobalContext } from '../context/GlobalState';
import Flow from "../components/editor/Flow/Flow.jsx";

// place holder for project editor



export default function Editor() {

    //const { activeProject } = useContext(GlobalContext);
    const [ projectName, setProjectName ] = useState('');

    useEffect(() => {
        //setProjectName(activeProject.meta.projectname);
        //console.log(`showing editor for project: ${activeProject.meta.projectname}`);
    }, []);

    if (activeProject === '' || activeProject === undefined ) {
        console.log('FROM EDITOR -> no project selected');

    }

    return (
        <Flow/>
    )
}