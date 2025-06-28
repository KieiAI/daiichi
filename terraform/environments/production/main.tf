resource "azurerm_resource_group" "rg" {
  name     = "daiichi"
  location = "japaneast"
}

module "acr-production" {
  source              = "../../modules/acr"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  acr_name            = "daiichi-acr-main"
}

module "app_service-production" {
  source              = "../../modules/app_service"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  acr_login_server    = module.acr.login_server
  acr_username        = module.acr.admin_username
  acr_password        = module.acr.admin_password
}

module "postgresql-production" {
  source              = "../../modules/postgresql"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  postgresql_name     = "daiichi-postgresql-main"
  postgresql_username = "daiichiuser"
  postgresql_password = "DaiichiPassword123!"
  postgresql_sku      = "B_Gen5_1"
  postgresql_version  = "12"
}

module "key_vault-production" {
  source              = "../../modules/key_vault"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  key_vault_name      = "daiichi-key-vault-production"
}