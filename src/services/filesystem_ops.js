import { 
    BaseDirectory, 
    exists, 
    createDir, 
    writeTextFile,
    readTextFile,
    readDir,
} from "@tauri-apps/api/fs";

const projectDir = "AutomataProjects";

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

    // create scaffolding for the project file
    const date = new Date();
    const scaffolding = {
        "data": {
            "graph": [],
            "labels": [],
            "regex": ""
        },
        "meta": {
            "projectname": `${projectName}`,
            "date_created": `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        }
    };


    try {
        await writeTextFile({
            contents: JSON.stringify(scaffolding),
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
            let json_data = JSON.parse(value);
            resolve(json_data);
        }).catch( (error) => {
            reject(error);
        })
    })
}


export async function saveProject(projectName, content) {

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