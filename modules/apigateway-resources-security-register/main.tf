resource "aws_apigatewayv2_integration" "lambda_handler" {
  api_id = data.aws_apigatewayv2_api.selected.id

  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.html_lambda.invoke_arn
}

resource "aws_apigatewayv2_route" "post_handler" {
  api_id    = data.aws_apigatewayv2_api.selected.id
  route_key = "POST /api/${var.domain}/${var.subdomain}/register"

  target = "integrations/${aws_apigatewayv2_integration.lambda_handler.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.html_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${data.aws_apigatewayv2_api.selected.execution_arn}/*/*"
}
