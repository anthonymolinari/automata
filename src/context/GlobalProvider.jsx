import { useState } from 'react';
import { GlobalContext } from './GlobalState';

export default function GlobalProvider({ children }) {
    // stores the active project as automaton object
    const [ activeProject, setActiveProject ] = useState(Object);
    // manage active view, this can be updated from anywhere in the
    // component tree
    const [ activeView, setActiveView ] = useState('');

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