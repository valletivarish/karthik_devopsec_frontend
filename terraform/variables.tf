variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-west-1"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for frontend static hosting"
  type        = string
  default     = "smart-meal-planner-25160052"
}

variable "ec2_public_dns" {
  description = "Public DNS hostname of the EC2 backend server"
  type        = string
  default     = "ec2-34-247-209-44.eu-west-1.compute.amazonaws.com"
}
