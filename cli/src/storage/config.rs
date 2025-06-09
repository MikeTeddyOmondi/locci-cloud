// src/storage/config.rs
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

pub struct ConfigStorage {
    path: PathBuf,
}

impl ConfigStorage {
    pub fn new() -> Self {
        let path = dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".locci")
            .join("config");
        ConfigStorage { path }
    }

    pub fn save_token(&self, token: &str) -> Result<(), StorageError> {
        fs::create_dir_all(self.path.parent().unwrap())?;
        let mut file = File::create(&self.path)?;
        file.write_all(token.as_bytes())?;
        Ok(())
    }

    pub fn get_token(&self) -> Result<Option<String>, StorageError> {
        if self.path.exists() {
            let mut file = File::open(&self.path)?;
            let mut token = String::new();
            file.read_to_string(&mut token)?;
            Ok(Some(token.trim().to_string()))
        } else {
            Ok(None)
        }
    }
}
