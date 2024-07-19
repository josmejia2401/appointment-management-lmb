locals {
    api_name = "api-${var.app_name}-${var.domain}-${var.env}"
    lambda_function_name = "lmb-${var.app_name}-${var.domain}-${var.subdomain}-login-${var.env}"
    
    policy = jsonencode({
        "Version" : "2012-10-17",
        "Statement" : [
            {
                Action : [ "logs:CreateLogGroup"],
                Effect : "Allow",
                Resource : "arn:aws:logs:${data.aws_region.current.id}:${data.aws_caller_identity.current.id}:*"
            },
            {
                Action : ["logs:CreateLogStream", "logs:PutLogEvents"],
                Effect : "Allow",
                Resource : "arn:aws:logs:${data.aws_region.current.id}:${data.aws_caller_identity.current.id}:log-group:/aws/lambda/${local.lambda_function_name}:*"
            },
            {
                "Action" : [ "dynamodb:GetItem" ],
                "Effect" : "Allow",
                "Resource" : [
                    "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.id}:table/man-roles-${var.env}"
                ]
            }
        ]
  })
}
