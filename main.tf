terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      iac = "terraform"
    }
  }
  #access_key = "my-access-key"
  #secret_key = "my-secret-key"
}



####################
# DYNAMO
####################
module "users_dynamodb" {
  source = "./modules/users-dynamodb"
}

module "token_dynamodb" {
  source = "./modules/token-dynamodb"
}

module "customers_dynamodb" {
  source = "./modules/customers-dynamodb"
}

module "services_dynamodb" {
  source = "./modules/services-dynamodb"
}

####################
# API GATEWAY
####################
module "api_gateway" {
  source = "./modules/apigateway"
}

####################
# API GATEWAY AUTHORIZER
####################

module "api_gateway_resources_security_authorizer" {
  source = "./modules/apigateway-resources-security-authorizer"
  api_id = module.api_gateway.api_id # < output of module.api_gateway
}

####################
# API GATEWAY RESOURCES
####################

module "api_gateway_resources_security" {
  source = "./modules/apigateway-resources-security"
  api_id = module.api_gateway.api_id # < output of module.api_gateway
  depends_on = [
    module.api_gateway,
    module.users_dynamodb,
    module.token_dynamodb,
    module.customers_dynamodb
  ]
}

module "api_gateway_resources_security_register" {
  source = "./modules/apigateway-resources-security-register"
  api_id = module.api_gateway.api_id # < output of module.api_gateway
  depends_on = [
    module.api_gateway,
    module.users_dynamodb,
    module.token_dynamodb,
    module.customers_dynamodb
  ]
}

module "api_gateway_resources_core_service_create" {
  source        = "./modules/apigateway-resources-core-service-create"
  api_id        = module.api_gateway.api_id # < output of module.api_gateway
  authorizer_id = module.api_gateway_resources_security_authorizer.authorizer_id
  depends_on = [
    module.api_gateway,
    module.services_dynamodb
  ]
}

module "api_gateway_resources_core_service_update" {
  source        = "./modules/apigateway-resources-core-service-update"
  api_id        = module.api_gateway.api_id # < output of module.api_gateway
  authorizer_id = module.api_gateway_resources_security_authorizer.authorizer_id
  depends_on = [
    module.api_gateway,
    module.services_dynamodb
  ]
}

module "api_gateway_resources_core_service_delete" {
  source        = "./modules/apigateway-resources-core-service-delete"
  api_id        = module.api_gateway.api_id # < output of module.api_gateway
  authorizer_id = module.api_gateway_resources_security_authorizer.authorizer_id
  depends_on = [
    module.api_gateway,
    module.services_dynamodb
  ]
}