import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

const S3_BUCKET_NAME = "orders";
const LAMBDA_PROXY_NAME = "proxy";
const LAMBDA_STORER_NAME = "storer";
const API_GATEWAY_NAME = "apigw";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucket = new s3.Bucket(this, S3_BUCKET_NAME, {
      // removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create Storer Lambda
    const storerLambda = new lambda.Function(this, LAMBDA_STORER_NAME, {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, "../../../apps/storer")),
      handler: "lambda_function.lambda_handler",
      environment: {
        S3_BUCKET_NAME: bucket.bucketName,
      }
    });

    bucket.grantReadWrite(storerLambda);

    // Create Proxy Lambda
    const proxyLambda = new lambda.Function(this, LAMBDA_PROXY_NAME, {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, "../../../apps/proxy")),
      handler: "lambda_function.lambda_handler",
      environment: {
        STORER_LAMBDA_NAME: storerLambda.functionName,
      }
    });

    storerLambda.grantInvoke(proxyLambda);

    // Create API Gateway
    const appgw = new apigateway.RestApi(this, API_GATEWAY_NAME);

    // Add Proxy Lambda
    appgw.root.resourceForPath(LAMBDA_PROXY_NAME).addMethod("POST",
      new apigateway.LambdaIntegration(proxyLambda));
  }
}
