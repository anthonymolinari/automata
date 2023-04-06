use tauri::{
    CustomMenuItem,
    Menu,
    Submenu
};

pub fn setup_menu() -> Menu {
    Menu::new()
        .add_submenu(Submenu::new(
        "File", 
        Menu::new()
            .add_item(CustomMenuItem::new("new_project".to_string(), "New Project"))
            .add_item(CustomMenuItem::new("open_project".to_string(), "Open Project"))
            .add_item(CustomMenuItem::new("save".to_string(), "Save"))
            .add_item(CustomMenuItem::new("settings".to_string(), "Settings"))
            .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
        ))
        .add_submenu(Submenu::new(
            "View",
            Menu::new()
            .add_item(CustomMenuItem::new("something".to_string(), "Something"))
        ))
}
