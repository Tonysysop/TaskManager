
resource "aws_s3_bucket" "React_bucket" {
  bucket = var.bucket_name
  tags = {
    Name = "TinuTaskManager_bucket"
  }
}

resource "aws_s3_bucket_website_configuration" "React_Bucket_website_confg" {
  bucket = aws_s3_bucket.React_bucket.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_public_access_block" "React_bucket_Acl" {
  bucket = aws_s3_bucket.React_bucket.id
  block_public_acls = false
  block_public_policy = false
  ignore_public_acls = false
  restrict_public_buckets = false
}




resource "aws_s3_bucket_policy" "React_bucket_policy" {
  bucket = var.bucket_name
  policy = templatefile("./bucket_policy.json",{
    bucket_name=aws_s3_bucket.React_bucket.id
  })
}