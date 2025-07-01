terraform {
  required_version = ">= 1.3.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.37.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "daiichi"
    storage_account_name = "daiichitfstatestorage"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}