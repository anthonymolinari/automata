import { 
    BaseDirectory, 
    exists, 
    createDir, 
    writeTextFile,
    readTextFile,
    readDir,
} from "@tauri-apps/api/fs";

const projectDir = "AutomataProjects";
import { automaton } from "../models/automata";

export async function createNewProjectFiles(projectName) {
    // check if project exists
    if (await exists(`${projectDir}/${projectName}.json`, {
        dir: BaseDirectory.Document
    })) {
        console.log('Project File already exists')
        return false;
    }

    // create the base projects directory if it does not exist
    if (!(await exists(projectDir, {
        dir: BaseDirectory.Document
    }))) {
        await createDir(projectDir, {
            dir: BaseDirectory.Document,
            recursive: true,
        });
    } else {
        console.log('project directory exists');
    }

    let newProject = new automaton();
    newProject.autoName = projectName;
    // create scaffolding for the project file

    let data = newProject.serialize();

    try {
        await writeTextFile({
            contents: data,
            path: `${projectDir}/${projectName}.json`
        }, {
            dir: BaseDirectory.Document
        })
    } catch (e) {
        console.log(e);
    }
    
    return true;
}

// open, read contents of project file and returns as json
export async function openProject(projectName) {
    return new Promise( (resolve, reject) => {
        readTextFile(`${projectDir}/${projectName}`, {
            dir: BaseDirectory.Document
        }).then( (value) => {
            console.log(value);
            resolve(automaton.loads(JSON.parse(value)));
        }).catch( (error) => {
            reject(error);
        });
    })
}

// writes project content to file
export async function saveProject(projectName, project) {
    return new Promise( (resolve, reject) => {
        writeTextFile({
            contents: project,
            path: `${projectDir}/${projectName}.json`
        }, {
            dir: BaseDirectory.Document
        }).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    })
}


// retuns a list of project files from the projects directory
export async function getProjects() {
    let projects = [];
    try {
        projects = await readDir(projectDir, {
            dir: BaseDirectory.Document
        })
    } catch (e) {
        console.log(e);
    }
    return projects;
}
