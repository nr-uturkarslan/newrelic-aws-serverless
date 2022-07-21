import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

const DYNAMO_DB_TABLE_NAME = "orders";
const LAMBDA_PROXY_NAME = "proxy";
const API_GATEWAY_NAME = "my-apigw";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create Dynamo DB
    const dynamoDb = new dynamodb.Table(this, DYNAMO_DB_TABLE_NAME, {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING
      }
    });

    // Create Proxy Lambda
    const proxyLambda = new lambda.Function(this, LAMBDA_PROXY_NAME, {
      runtime: lambda.Runtime.JAVA_11,
      code: lambda.Code.fromAsset(path.join(__dirname, "../../../apps/proxy/target/proxy.jar")),
      handler: "handler.LambdaHandler::handleRequest",
      environment: {
        DYNAMO_DB_TABLE_NAME: dynamoDb.tableName,
      }
    });

    // Grant access to Proxy Lambda
    dynamoDb.grantReadWriteData(proxyLambda);

    // Create API Gateway
    const appgw  = new apigateway.RestApi(this, API_GATEWAY_NAME);

    // Add Proxy Lambda
    appgw.root.resourceForPath("proxy").addMethod("POST",
      new apigateway.LambdaIntegration(proxyLambda));
  }
}
