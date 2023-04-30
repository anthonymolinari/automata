import { useState } from 'react';
import { GlobalContext } from './GlobalState';

export default function GlobalProvider({ children }) {
    // stores the active project as automaton object
    const [ activeProject, setActiveProject ] = useState(Object);
    // manage active view, this can be updated from anywhere in the
    // component tree
    // todo: **** find better way to default to project selection
    // view, when application is first starting
    const [ activeView, setActiveView ] = useState('open_project');

    return (
        <GlobalContext.Provider value={{ 
            activeProject, 
            setActiveProject,
            activeView, 
            setActiveView,
        }}>
            {children}
        </GlobalContext.Provider>
    )
}
