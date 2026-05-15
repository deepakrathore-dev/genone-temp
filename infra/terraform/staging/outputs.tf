# ══════════════════════════════════════════════════════════════════════════════
# OUTPUTS
# These values are printed after "terraform apply" completes.
# Copy them — you'll need them to configure GoDaddy DNS and your app .env files.
# ══════════════════════════════════════════════════════════════════════════════

output "elastic_ip" {
  description = "★ Static public IP of your EC2 server — add this as A records in GoDaddy"
  value       = aws_eip.app.public_ip
}

output "ssh_command" {
  description = "SSH command to connect to your server"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app.public_ip}"
}

output "ec2_instance_id" {
  description = "EC2 instance ID — use this in AWS Console to start/stop the server"
  value       = aws_instance.app.id
}

output "rds_endpoint" {
  description = "★ RDS connection endpoint (host:port) — use in your backend DATABASE_URL"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_hostname" {
  description = "RDS hostname only (without port)"
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.postgres.port
}

output "database_url_template" {
  description = "★ Copy this into your backend .env as DATABASE_URL (fill in your password)"
  value       = "postgresql://${var.db_username}:YOUR_PASSWORD@${aws_db_instance.postgres.address}:5432/${var.db_name}"
  sensitive   = false
}

output "godaddy_dns_records" {
  description = "★ After apply — add these exact A records in GoDaddy DNS Management"
  value       = <<-EOT

    ┌─────────────────────────────────────────────────────────────────┐
    │  GoDaddy DNS Records to Add                                     │
    ├──────────┬────────────────────────┬──────────────────┬─────────┤
    │  Type    │  Host/Name             │  Points To       │  TTL    │
    ├──────────┼────────────────────────┼──────────────────┼─────────┤
    │  A       │  staging               │  ${aws_eip.app.public_ip}  │  600    │
    │  A       │  admin.staging         │  ${aws_eip.app.public_ip}  │  600    │
    │  A       │  api.staging           │  ${aws_eip.app.public_ip}  │  600    │
    └──────────┴────────────────────────┴──────────────────┴─────────┘

    This maps:
      staging.yourdomain.com       → Nginx → Frontend container (port 3000)
      admin.staging.yourdomain.com → Nginx → Admin container   (port 3001)
      api.staging.yourdomain.com   → Nginx → Backend container (port 4000)

  EOT
}

output "ami_used" {
  description = "Ubuntu AMI ID that was used — for reference"
  value       = data.aws_ami.ubuntu_24.id
}
