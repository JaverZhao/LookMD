use std::sync::Mutex;

static PENDING_FILE: Mutex<Option<String>> = Mutex::new(None);

#[tauri::command]
fn get_pending_file() -> Option<String> {
  let mut guard = PENDING_FILE.lock().unwrap();
  let file = guard.take();
  file
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let args: Vec<String> = std::env::args().collect();
  if args.len() > 1 {
    let mut guard = PENDING_FILE.lock().unwrap();
    *guard = Some(args[1].clone());
  }

  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![get_pending_file])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
