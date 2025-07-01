resource "azurerm_service_plan" "plan" {
  name                = "daiichi-plan"
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "app" {
  name                = var.app_service_name
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.plan.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true
  }

  app_settings = {
    WEBSITES_PORT            = "8000"
    DOCKER_CUSTOM_IMAGE_NAME = "${var.acr_login_server}/backend:latest"
  }
}

data "azurerm_container_registry" "acr" {
  name                = "daiichicontainerregistry"
  resource_group_name = var.resource_group_name
}

resource "azurerm_role_assignment" "acr_pull_role" {
  scope                = data.azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app.app.identity[0].principal_id
}

