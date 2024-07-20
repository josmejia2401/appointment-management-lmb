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

####################
# API GATEWAY
# IMPORTANTE: una vez generado la api, se debe hacer replace de inputs.tf > api_id 
# y actualizar el valor por el nuevo id, luego continuar con los pasos de abajo.
####################
module "api_gateway" {
  source = "./modules/apigateway"
}

####################
# API GATEWAY AUTHORIZER
####################
module "api_gateway_resources_security_authorizer" {
  source = "./modules/apigateway-resources-security-authorizer"
}

####################
# API GATEWAY RESOURCES
####################
module "api_gateway_resources_security" {
  source = "./modules/apigateway-resources-security"
}

module "api_gateway_resources_security_register" {
  source = "./modules/apigateway-resources-security-register"
}

