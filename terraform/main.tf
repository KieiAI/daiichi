provider "azurerm" {
  features {}
}

module "acr" {
  source = "./modules/acr"
}

module "app_service" {
  source = "./modules/app_service"
}

module "postgresql" {
  source = "./modules/postgresql"
}