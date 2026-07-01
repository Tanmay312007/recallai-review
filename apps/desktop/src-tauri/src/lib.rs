mod commands;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            open_file_dialog,
            save_file_dialog,
            read_text_file,
            write_text_file,
            copy_to_clipboard,
            paste_from_clipboard,
            send_notification,
            open_in_browser,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Lumora");
}
