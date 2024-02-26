use std::env;
use pkcore::analysis::store::db::sqlite::Sqlable;
use log::{debug, info};

pub(crate) struct Environment {
    pub(crate) db_path: String,
    pub(crate) bcm_path: String,
}

impl Environment {
    pub(crate) fn new() -> Self {
        let db_path = env::var("DB_PATH").unwrap_or_else(|_| "data/hups.db".to_string());
        let bcm_path = env::var("BCM_PATH").unwrap_or_else(|_| "bcm.csv".to_string());
        Self { db_path, bcm_path }
    }

    pub(crate) fn get_connection(&self) -> Result<rusqlite::Connection, rusqlite::Error> {
        info!("Opening connection to {}", self.db_path);
        let conn = rusqlite::Connection::open(&self.db_path)?;
        pkcore::analysis::store::db::headsup_preflop_result::HUPResult::create_table(&conn)
            .expect("TODO: panic message");
        Ok(conn)
    }
}