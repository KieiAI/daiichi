resource "azurerm_postgresql_flexible_server" "db" {
  name                   = "fastapidb"
  location               = var.location
  resource_group_name    = var.resource_group_name
  administrator_login    = "postgres"
  administrator_password = "Password123!"
  sku_name               = "B1ms"
  storage_mb             = 32768
  version                = "14"
  zone                   = "1"

  authentication {
    password_auth_enabled = true
  }
}