# Fetch available AZs in the chosen region dynamically.
# This avoids hardcoding "us-east-2a" — works even if you change regions.
data "aws_availability_zones" "available" {
  state = "available"
}

# ══════════════════════════════════════════════════════════════════════════════
# VPC
# Your private network on AWS. Nothing inside can be reached from the internet
# unless you explicitly allow it with an Internet Gateway + route table.
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true  # Lets resources resolve DNS names inside VPC
  enable_dns_hostnames = true  # Gives EC2 a hostname like ip-10-0-1-x.ec2.internal

  tags = {
    Name = "${local.name_prefix}-vpc"
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# INTERNET GATEWAY
# The door between your VPC and the public internet.
# Without this, nothing in the VPC can reach or be reached from the internet.
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${local.name_prefix}-igw"
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# SUBNETS
# ══════════════════════════════════════════════════════════════════════════════

# Public subnet — EC2 lives here. Has a route to the internet via the IGW.
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.name_prefix}-public-subnet"
    Tier = "public"
  }
}

# Private subnet 1 — RDS lives here. No route to internet. AZ[0] same as EC2.
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_1_cidr
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "${local.name_prefix}-private-subnet-1"
    Tier = "private"
  }
}

# Private subnet 2 — Required by AWS for RDS subnet group (must span 2 AZs).
# RDS only runs in one of them in staging (no Multi-AZ), but AWS needs both declared.
resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_2_cidr
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "${local.name_prefix}-private-subnet-2"
    Tier = "private"
  }
}

# ══════════════════════════════════════════════════════════════════════════════
# ROUTE TABLE — PUBLIC SUBNET
# Routes all internet-bound traffic (0.0.0.0/0) through the Internet Gateway.
# Only attached to the public subnet — private subnets have no such route.
# ══════════════════════════════════════════════════════════════════════════════
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${local.name_prefix}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
