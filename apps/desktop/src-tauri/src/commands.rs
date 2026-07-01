use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub platform: String,
}

#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        name: "Lumora".to_string(),
        version: "0.1.0".to_string(),
        platform: std::env::consts::OS.to_string(),
    }
}

#[tauri::command]
pub async fn open_file_dialog(
    app: AppHandle,
) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let file = app
        .dialog()
        .file()
        .add_filter("Documents", &["pdf", "docx", "md", "txt", "ppt", "pptx"])
        .add_filter("All Files", &["*"])
        .blocking_pick_file();

    Ok(file.map(|f| f.to_string()))
}

#[tauri::command]
pub async fn save_file_dialog(
    app: AppHandle,
    default_name: String,
) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let file = app
        .dialog()
        .file()
        .set_file_name(&default_name)
        .add_filter("All Files", &["*"])
        .blocking_save_file();

    Ok(file.map(|f| f.to_string()))
}

#[tauri::command]
pub async fn read_text_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn write_text_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, &content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
pub async fn copy_to_clipboard(
    app: AppHandle,
    text: String,
) -> Result<(), String> {
    use tauri_plugin_clipboard_manager::ClipboardExt;

    app.clipboard()
        .write_text(text)
        .map_err(|e| format!("Failed to copy: {}", e))
}

#[tauri::command]
pub async fn paste_from_clipboard(
    app: AppHandle,
) -> Result<String, String> {
    use tauri_plugin_clipboard_manager::ClipboardExt;

    app.clipboard()
        .read_text()
        .map_err(|e| format!("Failed to paste: {}", e))
}

#[tauri::command]
pub async fn send_notification(
    app: AppHandle,
    title: String,
    body: String,
) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;

    app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| format!("Failed to send notification: {}", e))
}

#[tauri::command]
pub async fn open_in_browser(app: AppHandle, url: String) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;

    app.opener()
        .open_path(url, None::<String>)
        .map_err(|e| format!("Failed to open URL: {}", e))
}
