output "Website_url" {
  value = aws_s3_bucket_website_configuration.React_Bucket_website_confg.website_endpoint
  description = "The S3 website endpoint URL"
  depends_on = [ aws_s3_bucket_website_configuration.React_Bucket_website_confg ]
}

output "bucket_name" {
  value = aws_s3_bucket.React_bucket.bucket
}