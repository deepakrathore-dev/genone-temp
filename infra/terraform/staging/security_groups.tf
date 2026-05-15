# ══════════════════════════════════════════════════════════════════════════════
# EC2 SECURITY GROUP
#
# Inbound (who can knock on EC2's door):
#   Port 22  — SSH: you/your team managing the server
#   Port 80  — HTTP: users visiting the site (Nginx listens here)
#   Port 443 — HTTPS: users visiting the site securely (Nginx listens here)
#
# Outbound (what EC2 is allowed to reach):
#   All traffic — EC2 needs to pull Docker images, reach RDS, call external APIs
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_security_group" "ec2" {
  name        = "${local.name_prefix}-ec2-sg"
  description = "Controls traffic to/from the EC2 app server"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH access (restrict to your IP via ssh_allowed_cidr)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  ingress {
    description      = "HTTP (Nginx forwards to containers)"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "HTTPS (Nginx with SSL cert)"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    description      = "All outbound (Docker pulls, RDS, external APIs)"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "${local.name_prefix}-ec2-sg"
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# RDS SECURITY GROUP
#
# Inbound (who can knock on PostgreSQL's door):
#   Port 5432 — ONLY from the EC2 security group.
#   Not from your laptop. Not from the internet. Only from EC2.
#   This is the key security rule — RDS is invisible to the outside world.
#
# Outbound:
#   None needed. RDS only responds to connections — it never initiates them.
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds-sg"
  description = "Allows PostgreSQL access only from the EC2 app server"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from EC2 only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  tags = {
    Name = "${local.name_prefix}-rds-sg"
  }
}
