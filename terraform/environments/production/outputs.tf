output "login_server" {
  value = module.acr.login_server
}

output "admin_username" {
  value = module.acr.admin_username
}

output "admin_password" {
  value = module.acr.admin_password
  sensitive = true
}