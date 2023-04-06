import { listen } from '@tauri-apps/api/event';
import { useState } from 'react';

import CreateProjectPage from "./components/CreateProject";
import DragNodeExample from "./components/motion/DragNodeExmaple";
import ProjectPicker from "./components/ProjectPicker";

// use context api to set current project w/ data

const views = [
  {name: 'open_project', component: <ProjectPicker/>},
  {name: 'new_project', component: <CreateProjectPage/>},
  {name: 'editor', component: <DragNodeExample/>}
];

function App() {
  const [view, setView] = useState(views[0]);
  // event listener for menu
  listen('menu', (event) => {
    console.log(`menu event on (${event.windowLabel}): ${event.payload}`);
    // update view according to event
    views.find((v) => {
      if (v.name == event.payload) {
        setView(v);
      }
    })
  });

  return (
    <div className="container">
      {view.component}
    </div>
  );
}

export default App;
