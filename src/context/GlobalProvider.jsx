import { useState } from 'react';
import { GlobalContext } from './GlobalState';

import { automaton } from '../models/automata';

export default function GlobalProvider({ children }) {
    // stores the active project as automaton object
    const [ activeProject, setActiveProject ] = useState(Object);
    // manage active view, this can be updated from anywhere in the
    // component tree
    // todo: **** find better way to default to project selection
    // view, when application is first starting
    const [ activeView, setActiveView ] = useState('open_project');


    const [ stateMachine, setStateMachine ] = useState(new automaton()); 

    return (
        <GlobalContext.Provider value={{ 
            activeProject, 
            setActiveProject,
            activeView, 
            setActiveView,
            stateMachine,
            setStateMachine,
        }}>
            {children}
        </GlobalContext.Provider>
    )
}
