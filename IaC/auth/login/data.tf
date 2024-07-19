data "aws_caller_identity" "current" {
  provider = aws.main
}

data "aws_region" "current" {
  #provider = "aws"
  provider = aws.main
}

data "aws_api_gateway_rest_api" "selected" {
  provider = aws.main
  name = "${local.api_name}"
}

data "archive_file" "lambda_package" {
  type = "zip"
  source_file = "index.js"
  output_path = "../../../lambdas/auth/login/index.zip"
}