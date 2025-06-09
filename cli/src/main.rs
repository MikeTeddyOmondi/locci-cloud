use clap::Parser;
use dotenv::dotenv;
use uuid::Uuid;

use locci_cli::api::client::ApiClient;
use locci_cli::auth::{client::AuthClient, service::AuthService};
use locci_cli::cli::{Cli, Commands};
use locci_cli::storage::config::ConfigStorage;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let cli = Cli::parse();
    let auth_url = std::env::var("LOCCI_AUTH_API_URL")?;
    let api_gateway_url = std::env::var("LOCCI_API_GATEWAY_URL")?;
    let token_storage = ConfigStorage::new();
    let auth_client = AuthClient::new(&auth_url);
    let auth_service = AuthService::new(auth_client, token_storage);
    let api_client = ApiClient::new(api_gateway_url);

    match cli.command {
        Commands::Login { provider, code } => {
            if let Some(code) = code {
                // Manual code exchange
                let state = Uuid::new_v4().to_string();
                let _token = auth_service.complete_auth(&provider, &code, &state).await?;
                // println!("Token: {}", token);
                println!("Authenticated successfully. Token stored in ~/.locci/config");
            } else {
                // Initiate OAuth2 flow
                let state = Uuid::new_v4().to_string();
                let auth_url = auth_service.initiate_auth(&provider, &state)?;
                println!("Open this URL in your browser:\n{}", auth_url);
                println!("Enter the authorization code from the redirect URL:");
                let mut code = String::new();
                std::io::stdin().read_line(&mut code)?;
                let code = code.trim();
                let _token = auth_service.complete_auth(&provider, code, &state).await?;
                // println!("Token: {}", token);
                println!("Authenticated successfully. Token stored in ~/.locci/config");
            }
        }
        Commands::Fetch { endpoint } => {
            let token = auth_service
                .get_token()?
                .ok_or("Please run `locci login` first to authenticate.")?;
            let response = api_client.fetch_data(&endpoint, &token).await?;
            println!("API Response: {}", response.message);
        }
    }

    Ok(())
}
