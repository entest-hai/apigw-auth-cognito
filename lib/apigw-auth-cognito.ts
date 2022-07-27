import { aws_apigateway, aws_lambda, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";

export class ApiGwAuthStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // api gateway
    const api = new aws_apigateway.RestApi(this, "AuthApiDemo", {
      restApiName: "AuthApiDemo",
    });

    // lambda busines backend
    const lambdaBackend = new aws_lambda.Function(this, "LambdaBackend", {
      functionName: "LambdaBackend",
      runtime: aws_lambda.Runtime.PYTHON_3_9,
      code: aws_lambda.Code.fromAsset(path.join(__dirname, "./../lambda")),
      handler: "lambda_backend.handler",
    });

    // lambda authorizer
    const lambdaAuthorizer = new aws_lambda.Function(this, "LambdaAuth", {
      functionName: "LambdaAuth",
      runtime: aws_lambda.Runtime.NODEJS_16_X,
      code: aws_lambda.Code.fromAsset(path.join(__dirname, "./../lambda")),
      handler: "lambda_auth.handler",
      environment: {
        JWKS_ENDPOINT: "",
        ACCOUNT_ID: this.account,
        API_ID: api.restApiId,
        SM_JWKS_SECRET_NAME: "",
      },
    });

    // authorizer api gateway
    const authorizer = new aws_apigateway.TokenAuthorizer(
      this,
      "JwtTokenAuthLambda",
      {
        handler: lambdaAuthorizer,
        validationRegex:
          "^(Bearer )[a-zA-Z0-9-_]+?.[a-zA-Z0-9-_]+?.([a-zA-Z0-9-_]+)$",
      }
    );

    // lambda integration target
    const apiLambdaIntegration = new aws_apigateway.LambdaIntegration(
      lambdaBackend,
      {
        requestTemplates: { "application/json": '{ "statusCode": "200" }' },
      }
    );

    // apigw add resource
    const bookResource = api.root.addResource("book");

    // resource add method
    bookResource.addMethod("GET", apiLambdaIntegration, { authorizer });
  }
}

export class CongitoUserPool extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // cognito user pool

    // sign up

    // sign in

    // app client
  }
}