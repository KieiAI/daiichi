resource "azurerm_app_service_plan" "plan" {
  name                = "fastapi-plan"
  location            = var.location
  resource_group_name = var.resource_group_name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "Basic"
    size = "B1"
  }
}

resource "azurerm_app_service" "app" {
  name                = "fastapi-app"
  location            = var.location
  resource_group_name = var.resource_group_name
  app_service_plan_id = azurerm_app_service_plan.plan.id

  site_config {
    linux_fx_version = "DOCKER|fastapiacr123456.azurecr.io/fastapi-app:latest"
  }

  app_settings = {
    WEBSITES_PORT = "8000"
    SECRET_KEY    = "dummy-key"
  }
}