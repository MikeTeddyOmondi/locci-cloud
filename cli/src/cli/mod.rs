use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "locci")]
#[command(about = "Locci Cloud CLI")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Log in using OAuth2 (e.g., Google)
    Login {
        /// OAuth2 provider (e.g., google)
        #[arg(long, default_value = "google")]
        provider: String,
        /// Authorization code (for manual callback)
        #[arg(long)]
        code: Option<String>,
    },
    /// Fetch request to API gateway
    Fetch {
        /// API endpoint (e.g., data)
        #[arg(long, default_value = "data")]
        endpoint: String,
    },
}
