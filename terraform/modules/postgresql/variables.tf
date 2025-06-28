variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "server_name" {
  type = string
}

variable "admin_username" {
  type = string
}

variable "admin_password" {
  type = string
}

variable "sku_name" {
  type    = string
}

variable "db_version" {
  type    = string
  default = "14"
}

variable "db_name" {
  type = string
}