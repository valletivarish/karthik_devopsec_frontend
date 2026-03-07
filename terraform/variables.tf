variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "eu-west-1"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for frontend static hosting"
  type        = string
  default     = "meal-planner-frontend-25173421"
}
