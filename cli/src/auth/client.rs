use anyhow::Result;
use reqwest::Client;
use thiserror::Error;
use url::Url;

#[derive(Error, Debug)]
pub enum AuthClientError {
    #[error("Request error: {0}")]
    Request(#[from] reqwest::Error),
    #[error("Invalid response: {0}")]
    InvalidResponse(String),
}

pub struct AuthClient {
    base_url: String,
    client: Client,
}

impl AuthClient {
    pub fn new(base_url: &str) -> Self {
        AuthClient {
            base_url: base_url.to_string(),
            client: Client::new(),
        }
    }

    pub fn get_auth_url(&self, provider: &str, state: &str) -> Result<Url, AuthClientError> {
        let url = format!("{}/auth/oauth/{}?state={}", self.base_url, provider, state);
        Url::parse(&url)
            .map_err(|e| AuthClientError::InvalidResponse(format!("URL parse error: {}", e)))
    }

    pub async fn exchange_code(&self, provider: &str, code: &str, state: &str) -> Result<String, AuthClientError> {
        let url = format!("{}/auth/oauth/exchange/{}", self.base_url, provider);
        let response = self
            .client
            .post(&url)
            .json(&serde_json::json!({ "code": code, "state": state }))
            .send()
            .await?;

        let json: serde_json::Value = response.json().await?;
        json.get("token")
            .and_then(|t| t.as_str())
            .map(|t| t.to_string())
            .ok_or_else(|| AuthClientError::InvalidResponse("Missing token in response".to_string()))
    }
}
