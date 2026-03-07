output "frontend_url" {
  description = "Frontend website URL"
  value       = "http://${aws_s3_bucket.frontend.bucket}.s3-website-${var.aws_region}.amazonaws.com"
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.frontend.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.frontend.arn
}
