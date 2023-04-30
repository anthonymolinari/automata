// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


mod setup;

use crate::setup::{
    menu::setup_menu
};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {  
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet
        ])
        .menu(setup_menu().to_owned())
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "new_project" => {
                    event.window().emit("menu", "new_project").unwrap();
                }
                "open_project" => {
                    event.window().emit("menu", "open_project").unwrap();
                }
                "save" => {
                    event.window().emit("action", "save").unwrap();
                }
                "settings" => {
                    event.window().emit("menu", "settings").unwrap();
                }
                "quit" => {
                    std::process::exit(0);
                }
                "something" => {
                    event.window().emit("menu", "editor").unwrap();
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
