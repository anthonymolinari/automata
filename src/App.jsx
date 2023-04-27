import { listen } from '@tauri-apps/api/event';
import { useState, useContext, useEffect } from 'react';

import CreateProjectPage from "./components/CreateProject";
import Editor from './pages/EditorPage';
import ProjectPicker from "./components/ProjectPicker";
import GlobalProvider from './context/GlobalProvider';
import { GlobalContext } from './context/GlobalState';
import { Global } from '@emotion/react';

const views = [
  {name: 'open_project', component: <ProjectPicker/>},
  {name: 'new_project', component: <CreateProjectPage/>},
  {name: 'editor', component: <Editor/>}
];

function App() {

  const { activeView, setActiveView } = useContext(GlobalContext);

  useEffect(() => {
    setActiveView('open_project');
    console.log('mounting main component...');
    console.log(`active view: ${activeView}`);

  }, [activeView])

  // event listener for menu
  listen('menu', (event) => {
    console.log(`menu event on (${event.windowLabel}): ${event.payload}`);
    setActiveView(event.payload);
  });

  if (!activeView) {
    setActiveView('open_project');
  }

  return (
    <GlobalProvider>
        {views.find((v) => v.name === activeView).component}
    </GlobalProvider>
  );
}

export default App;
