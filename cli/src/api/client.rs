use crate::api::models::ApiResponse;
use reqwest::Client;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Request error: {0}")]
    Request(#[from] reqwest::Error),
    #[error("Authentication required")]
    AuthRequired,
}

pub struct ApiClient {
    base_url: String,
    client: Client,
}

impl ApiClient {
    pub fn new(base_url: String) -> Self {
        ApiClient {
            base_url,
            client: Client::new(),
        }
    }

    pub async fn fetch_data(&self, endpoint: &str, token: &str) -> Result<ApiResponse, ApiError> {
        let url = format!("{}/{}", self.base_url, endpoint.trim_start_matches('/'));
        let response = self
            .client
            .get(&url)
            .bearer_auth(token)
            .send()
            .await?
            .json()
            .await?;
        Ok(response)
    }
}