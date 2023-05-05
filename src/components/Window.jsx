import { listen } from '@tauri-apps/api/event';
import { useContext, useEffect } from 'react';

import CreateProjectPage from "./CreateProject";
import Editor from '../pages/EditorPage';
import ProjectPicker from "./ProjectPicker";
import { GlobalContext } from '../context/GlobalState';

import { CircularProgress, Box } from '@mui/material';

const views = [
  {name: 'open_project', component: <ProjectPicker/>},
  {name: 'new_project', component: <CreateProjectPage/>},
  {name: 'editor', component: <Editor/>},
  {name: 'settings', component: (<h1>settings</h1>)},
];

export default function Window() {
  const { activeView, setActiveView } = useContext(GlobalContext);

  useEffect( () => {
    console.log('mounting main window, or did update');
    // needs to listen for changes to activeView 
  }, [activeView]);

  // event listener for menu
  listen('menu', (event) => {
    console.log(`menu event on (${event.windowLabel}): ${event.payload}`);
    setActiveView(event.payload);
  });

  listen('action', (event) => {
    console.log(`action event on (${event.windowLabel}): ${event.payload}`);
    if (event.payload === 'save') {
      console.log('saving current project');
    }
  });

  // when no view is active, loading animation & set view
  if (!activeView) {
    console.log('no active view set');
    setActiveView('open_project');
    return (
      <Box sx={{ display: 'flex' }}>
        <CircularProgress />
      </Box>
    )
  }   
  // else 
  return (
    <div className="window-container" style={{width: '97vw',height: '97vh'}}>
        {views.find((v) => v.name === activeView).component}
    </div>
  )
}


