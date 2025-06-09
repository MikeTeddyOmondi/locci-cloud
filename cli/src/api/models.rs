use serde::Deserialize;

#[derive(Deserialize)]
pub struct ApiResponse {
    pub message: String,
    // Add fields based on your API gateway response
}