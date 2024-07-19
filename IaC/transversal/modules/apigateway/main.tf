resource "aws_api_gateway_rest_api" "ppma" {
  name = "${local.api_name}"
  description = "${local.api_name} API Gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}