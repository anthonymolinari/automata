import { useContext } from 'react';

import { GlobalContext } from '../context/GlobalState';

export default function Editor() {

    const { activeProject } = useContext(GlobalContext);

    useEffect(() => {
        console.log(activeProject);
    }, [])

    return (
        <h1>Editor Page</h1>
    )
}