# ══════════════════════════════════════════════════════════════════════════════
# AMI — Ubuntu 24.04 LTS (latest)
# Dynamically fetches the most recent Ubuntu 24.04 AMI from Canonical's
# official AWS account (099720109477). No need to hardcode AMI IDs which
# differ per region and go stale when Ubuntu releases patches.
# ══════════════════════════════════════════════════════════════════════════════
data "aws_ami" "ubuntu_24" {
  most_recent = true
  owners      = ["099720109477"] # Canonical — official Ubuntu publisher on AWS

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# SSH KEY PAIR
# Uploads your public key to AWS. The matching private key stays on your laptop.
# You never share the private key — AWS only stores the public key.
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_key_pair" "deployer" {
  key_name   = "${local.name_prefix}-deployer-key"
  public_key = var.ssh_public_key

  tags = {
    Name = "${local.name_prefix}-deployer-key"
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# IAM ROLE FOR EC2
#
# This is the "machine identity" for the EC2 instance.
# It lets EC2 authenticate with AWS services (like ECR) without storing
# your personal access keys on the server.
#
# Flow: EC2 assumes this role → gets temporary credentials automatically →
#       uses them to pull Docker images from ECR securely.
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_iam_role" "ec2" {
  name        = "${local.name_prefix}-ec2-role"
  description = "Allows EC2 to pull images from ECR and access AWS services"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${local.name_prefix}-ec2-role"
  }
}

# Grants EC2 read-only access to ECR (pull Docker images, no push/delete).
resource "aws_iam_role_policy_attachment" "ec2_ecr_readonly" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Instance profile = the wrapper that lets you attach an IAM role to EC2.
# AWS requires this indirection — you can't attach a role to EC2 directly.
resource "aws_iam_instance_profile" "ec2" {
  name = "${local.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# ══════════════════════════════════════════════════════════════════════════════
# EC2 INSTANCE
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu_24.id
  instance_type          = var.ec2_instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = aws_key_pair.deployer.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  root_block_device {
    volume_type           = var.ec2_volume_type
    volume_size           = var.ec2_volume_size
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${local.name_prefix}-root-volume"
    }
  }

  # ── User Data Script ──────────────────────────────────────────────────────
  # Runs once automatically on first boot. Installs Docker + Docker Compose
  # + AWS CLI so the server is ready to pull and run your containers.
  user_data = <<-EOF
    #!/bin/bash
    set -euo pipefail
    exec > /var/log/user-data.log 2>&1

    echo "=== Starting server bootstrap ==="

    # ── System update ─────────────────────────────────────────────────────
    apt-get update -y
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

    # ── Install Docker ────────────────────────────────────────────────────
    apt-get install -y ca-certificates curl gnupg lsb-release

    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
      | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y \
      docker-ce \
      docker-ce-cli \
      containerd.io \
      docker-buildx-plugin \
      docker-compose-plugin

    # Add ubuntu user to docker group so it can run docker without sudo
    usermod -aG docker ubuntu

    systemctl enable docker
    systemctl start docker

    # ── Install AWS CLI v2 ────────────────────────────────────────────────
    # Used by deploy scripts to authenticate with ECR (docker login)
    apt-get install -y unzip
    curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
      -o /tmp/awscliv2.zip
    unzip -q /tmp/awscliv2.zip -d /tmp
    /tmp/aws/install
    rm -rf /tmp/aws /tmp/awscliv2.zip

    # ── App directory ─────────────────────────────────────────────────────
    # GitHub Actions will SSH in and deploy docker-compose.yml here
    mkdir -p /opt/genone
    chown ubuntu:ubuntu /opt/genone

    echo "=== Bootstrap complete ==="
  EOF

  # Replace instance only after new one is ready (zero-downtime for future changes)
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${local.name_prefix}-app-server"
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# ELASTIC IP
# Reserves a static public IP. Attaches it to the EC2 instance.
# Even if you stop/start EC2, this IP stays the same.
# Add this IP as an A record in GoDaddy once after terraform apply.
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_eip" "app" {
  domain = "vpc"

  tags = {
    Name = "${local.name_prefix}-eip"
  }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}
