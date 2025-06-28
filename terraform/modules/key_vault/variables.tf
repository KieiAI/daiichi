variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "tenant_id" {
  type = string
}

variable "key_vault_name" {
  type = string
}

variable "secrets" {
  type = map(string)
  description = "Key-value pairs to store as secrets in Key Vault"
}