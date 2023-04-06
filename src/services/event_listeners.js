import { listen } from '@tauri-apps/api/event';

export async function menuListener() {
    const unlisten = await listen('menu', (event) => {
        console.log(`Got menu event from backend: ${event.windowLabel}, payload: ${event.payload}`);
    });

    return unlisten;
}