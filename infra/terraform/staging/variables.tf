# ══════════════════════════════════════════════════════════════════════════════
# PROJECT
# ══════════════════════════════════════════════════════════════════════════════

variable "project_name" {
  description = "Project name — used as prefix in all resource names and tags"
  type        = string
  default     = "genone"
}

variable "environment" {
  description = "Deployment environment (staging | production)"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be 'staging' or 'production'."
  }
}

variable "aws_region" {
  description = "AWS region to deploy all resources into"
  type        = string
  default     = "us-east-2"
}

# ══════════════════════════════════════════════════════════════════════════════
# NETWORK
# ══════════════════════════════════════════════════════════════════════════════

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR for the public subnet — EC2 lives here"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_1_cidr" {
  description = "CIDR for private subnet 1 — RDS lives here (AZ a)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "private_subnet_2_cidr" {
  description = "CIDR for private subnet 2 — RDS subnet group requires 2 AZs (AZ b)"
  type        = string
  default     = "10.0.3.0/24"
}

# ══════════════════════════════════════════════════════════════════════════════
# EC2  ★ COST-SENSITIVE ★
# Changing ec2_instance_type has the biggest impact on monthly bill.
# t3.micro  = ~$7.50/mo   (1 vCPU, 1 GB  — free tier eligible, tight for 3 containers)
# t3.small  = ~$15/mo     (2 vCPU, 2 GB  — recommended for staging)
# t3.medium = ~$30/mo     (2 vCPU, 4 GB  — comfortable, use if containers are slow)
# t3.large  = ~$60/mo     (2 vCPU, 8 GB  — pre-production / near-production load)
# ══════════════════════════════════════════════════════════════════════════════

variable "ec2_instance_type" {
  description = "★ COST: EC2 instance type. See comments above for pricing."
  type        = string
  default     = "t3.small"
}

variable "ec2_volume_size" {
  description = "★ COST: EC2 root EBS volume size in GB (each extra 10 GB ≈ +$0.80/mo)"
  type        = number
  default     = 20
}

variable "ec2_volume_type" {
  description = "EBS volume type. gp3 is cheaper and faster than gp2 — keep as gp3"
  type        = string
  default     = "gp3"
}

variable "ssh_public_key" {
  description = "Your SSH public key (paste contents of ~/.ssh/id_rsa.pub or ~/.ssh/id_ed25519.pub)"
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "IP CIDR allowed to SSH into EC2. Use your own IP/32 for security (e.g. 203.0.113.10/32). 0.0.0.0/0 = open to world."
  type        = string
  default     = "0.0.0.0/0"
}

# ══════════════════════════════════════════════════════════════════════════════
# RDS  ★ COST-SENSITIVE ★
# db.t3.micro  = ~$13/mo  (1 vCPU, 1 GB  — free tier eligible, fine for staging)
# db.t3.small  = ~$25/mo  (2 vCPU, 2 GB  — if DB becomes bottleneck)
# db.t3.medium = ~$52/mo  (2 vCPU, 4 GB  — production-like workloads)
# ══════════════════════════════════════════════════════════════════════════════

variable "rds_instance_class" {
  description = "★ COST: RDS instance class. See comments above for pricing."
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "★ COST: RDS storage in GB. Minimum 20. Each extra 10 GB ≈ +$1.15/mo."
  type        = number
  default     = 20

  validation {
    condition     = var.rds_allocated_storage >= 20
    error_message = "rds_allocated_storage must be at least 20 GB."
  }
}

variable "rds_engine_version" {
  description = "PostgreSQL major version"
  type        = string
  default     = "16"
}

variable "rds_multi_az" {
  description = "★ COST: Multi-AZ doubles RDS cost. false = staging. true = production HA only."
  type        = bool
  default     = false
}

variable "rds_backup_retention_days" {
  description = "★ COST: Days to retain automated backups (0 = disabled, saves storage cost). 7 recommended for staging."
  type        = number
  default     = 7

  validation {
    condition     = var.rds_backup_retention_days >= 0 && var.rds_backup_retention_days <= 35
    error_message = "rds_backup_retention_days must be between 0 and 35."
  }
}

variable "rds_deletion_protection" {
  description = "Prevent accidental RDS deletion. Set true in production. false is fine for staging."
  type        = bool
  default     = false
}

# ══════════════════════════════════════════════════════════════════════════════
# DATABASE CREDENTIALS
# Never put real values here. Set them in terraform.tfvars (gitignored).
# ══════════════════════════════════════════════════════════════════════════════

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "genone_staging"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "genone_admin"
}

variable "db_password" {
  description = "PostgreSQL master password. Must be 8+ chars. Set in terraform.tfvars — never hardcode."
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_password) >= 8
    error_message = "db_password must be at least 8 characters."
  }
}
