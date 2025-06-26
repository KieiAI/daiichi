provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "daiichi"
  location = "japaneast"
}

module "acr" {
  source              = "../../modules/acr"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
}