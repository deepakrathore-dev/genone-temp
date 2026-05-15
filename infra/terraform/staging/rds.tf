# ══════════════════════════════════════════════════════════════════════════════
# DB SUBNET GROUP
#
# Tells AWS which subnets RDS is allowed to use.
# Must span at least 2 Availability Zones — AWS requirement even for single-AZ.
# RDS will physically run in private_1 (staging), private_2 is just a standby
# declaration. No extra cost for the second subnet.
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_db_subnet_group" "main" {
  name        = "${local.name_prefix}-db-subnet-group"
  description = "RDS subnet group (private subnets only, no internet access)"
  subnet_ids  = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "${local.name_prefix}-db-subnet-group"
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# RDS POSTGRESQL
#
# Lives in private subnets. EC2 reaches it via its private VPC IP.
# Never publicly accessible — not reachable from your laptop directly.
# To connect from laptop for debugging: SSH into EC2, then connect from there.
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_db_instance" "postgres" {
  identifier     = "${local.name_prefix}-postgres"
  engine         = "postgres"
  engine_version = var.rds_engine_version

  # ── Cost-sensitive settings ────────────────────────────────────────────────
  instance_class    = var.rds_instance_class     # ★ biggest cost lever
  allocated_storage = var.rds_allocated_storage  # ★ storage cost
  storage_type      = "gp3"                      # gp3 is cheaper + faster than gp2

  # ── Credentials ───────────────────────────────────────────────────────────
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # ── Network ───────────────────────────────────────────────────────────────
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false # Never expose RDS to the internet

  # ── High Availability ─────────────────────────────────────────────────────
  # false = single AZ, cheaper. Set to true in production for failover.
  multi_az = var.rds_multi_az

  # ── Storage encryption ────────────────────────────────────────────────────
  storage_encrypted = true

  # ── Backups ───────────────────────────────────────────────────────────────
  backup_retention_period = var.rds_backup_retention_days
  backup_window           = "03:00-04:00"      # 3–4 AM UTC (low traffic window)
  maintenance_window      = "sun:04:00-sun:05:00"  # Sunday 4-5 AM UTC

  # ── Deletion settings ─────────────────────────────────────────────────────
  deletion_protection = var.rds_deletion_protection
  # skip_final_snapshot = true means no backup is taken when you destroy this.
  # Fine for staging. Set to false and give final_snapshot_identifier in production.
  skip_final_snapshot = true

  # Apply changes immediately in staging (avoids waiting for maintenance window)
  apply_immediately = true

  tags = {
    Name = "${local.name_prefix}-postgres"
  }
}
