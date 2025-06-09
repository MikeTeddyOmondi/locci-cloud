use crate::storage::config::ConfigStorage;
use super::client::{AuthClient, AuthClientError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuthError {
    #[error("Client error: {0}")]
    Client(#[from] AuthClientError),
    #[error("Storage error: {0}")]
    Storage(#[from] crate::storage::config::StorageError),
}

pub struct AuthService {
    auth_client: AuthClient,
    token_storage: ConfigStorage,
}

impl AuthService {
    pub fn new(auth_client: AuthClient, token_storage: ConfigStorage) -> Self {
        AuthService {
            auth_client,
            token_storage,
        }
    }

    pub fn initiate_auth(&self, provider: &str, state: &str) -> Result<url::Url, AuthError> {
        self.auth_client.get_auth_url(provider, state).map_err(AuthError::Client)
    }

    pub async fn complete_auth(&self, provider: &str, code: &str, state: &str) -> Result<String, AuthError> {
        let token = self.auth_client.exchange_code(provider, code, state).await?;
        self.token_storage.save_token(&token)?;
        Ok(token)
    }

    pub fn get_token(&self) -> Result<Option<String>, AuthError> {
        self.token_storage.get_token().map_err(AuthError::Storage)
    }
}
