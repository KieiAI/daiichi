output "postgresql_server_name" {
  value = azurerm_postgresql_flexible_server.this.name
}

output "postgresql_server_fqdn" {
  value = azurerm_postgresql_flexible_server.this.fqdn
}

output "postgresql_database_name" {
  value = azurerm_postgresql_flexible_server_database.this.name
}