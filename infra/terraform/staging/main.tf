terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # ── Remote State (recommended when team grows) ──────────────────────────────
  # Uncomment this block and create the S3 bucket + DynamoDB table first.
  # Run: aws s3 mb s3://genone-terraform-state --region us-east-2
  # Run: aws dynamodb create-table --table-name genone-terraform-state-lock \
  #        --attribute-definitions AttributeName=LockID,AttributeType=S \
  #        --key-schema AttributeName=LockID,KeyType=HASH \
  #        --billing-mode PAY_PER_REQUEST --region us-east-2
  #
  # backend "s3" {
  #   bucket         = "genone-terraform-state"
  #   key            = "staging/terraform.tfstate"
  #   region         = "us-east-2"
  #   dynamodb_table = "genone-terraform-state-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
