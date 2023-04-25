import { listen } from '@tauri-apps/api/event';
import { useState, useContext, useEffect } from 'react';

import CreateProjectPage from "./components/CreateProject";
import DragNodeExample from "./components/motion/DragNodeExmaple";
import ProjectPicker from "./components/ProjectPicker";
import GlobalProvider from './context/GlobalProvider';
import { GlobalContext } from './context/GlobalState';

// use context api to set current project w/ data

const views = [
  {name: 'open_project', component: <ProjectPicker/>},
  {name: 'new_project', component: <CreateProjectPage/>},
  {name: 'editor', component: <DragNodeExample/>}
];

function App() {

  const { activeView, setActiveView, activeProject } = useContext(GlobalContext);
  const [view, setView] = useState(views[0]);

  useEffect(() => {
    console.log('mounting main component...');
    console.log(`active view: ${activeView}`);
  }, [activeView, activeProject])

  // event listener for menu
  listen('menu', (event) => {
    console.log(`menu event on (${event.windowLabel}): ${event.payload}`);
    // update view according to event
    views.find((v) => {
      if (v.name == event.payload) {
        setView(v);
        setActiveView(v.name);
      }
    })
  });

  return (
    <GlobalProvider>
        {view.component}
    </GlobalProvider>
  );
}

export default App;
