output "login_server" {
  value = module.acr-develop.login_server
}

output "admin_username" {
  value = module.acr-develop.admin_username
}

output "admin_password" {
  value     = module.acr-develop.admin_password
  sensitive = true
}