resource "azurerm_resource_group" "rg" {
  name     = "daiichi"
  location = "japaneast"
}

module "acr" {
  source              = "../../modules/acr"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  acr_username        = "daiichiuser"
  acr_password        = "DaiichiPassword123!"
  acr_login_server    = "daiichicontainerregistry.azurecr.io"
}

module "app_service" {
  source              = "../../modules/app_service"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  acr_login_server    = module.acr.login_server
  acr_username        = module.acr.admin_username
  acr_password        = module.acr.admin_password
  app_service_name    = "daiichi-backend"
}

module "postgresql" {
  source              = "../../modules/postgresql"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  server_name         = "daiichi-postgresql"
  admin_username      = "daiichiuser"
  admin_password      = "DaiichiPassword123!"
  sku_name            = "B_Standard_B1ms"
  db_version          = "12"
  db_name             = "daiichi_db-develop"
}

module "key_vault" {
  source              = "../../modules/key_vault"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  key_vault_name      = "daiichi-kv"
  tenant_id           = "d45bfdea-e0d9-4ecf-b2a9-826ed71fa2f1"
  secrets             = {}
}