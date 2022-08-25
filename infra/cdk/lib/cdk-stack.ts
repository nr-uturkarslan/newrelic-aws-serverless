import { Stack, StackProps, RemovalPolicy, CfnParameter } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

const S3_BUCKET_NAME = "storage";
const LAMBDA_PROXY_NAME = "proxy";
const LAMBDA_STORER_NAME = "storer";
const API_GATEWAY_NAME = "apigw";

//--- Run command ---//
// cdk deploy --parameters newRelicAccountId=$NEWRELIC_ACCOUNT_ID

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Get New Relic account ID
    const newRelicAccountId = new CfnParameter(this, "newRelicAccountId", {
      type: "Number",
      description: "New Relic account ID",
    });

    // Create S3 bucket
    const bucket = new s3.Bucket(this, S3_BUCKET_NAME, {
      removalPolicy: RemovalPolicy.RETAIN,
    });
    
    // Get AWS account ID
    const awsAccountId = Stack.of(this).account;
    const awsAccountRegion = Stack.of(this).region

    // Get New Relic managed policy
    const newRelicLicenseKeyPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["secretsmanager:GetSecretValue"],
      resources: [`arn:aws:secretsmanager:${awsAccountRegion}:${awsAccountId}:secret:NEW_RELIC_LICENSE_KEY*`]
    });

    // Get Lambda layer - AWS region is important!
    const newrelicLayer = lambda.LayerVersion.fromLayerVersionAttributes(this, "NewRelicLambdaLayer", {
      layerVersionArn: `arn:aws:lambda:${awsAccountRegion}:451483290750:layer:NewRelicPython39:23`
    });

    // Create Storer Lambda
    const storerLambda = new lambda.Function(this, LAMBDA_STORER_NAME, {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, "../../../apps/storer")),
      handler: "newrelic_lambda_wrapper.handler",
      logRetention: logs.RetentionDays.ONE_DAY,
      layers: [newrelicLayer],
      initialPolicy:[newRelicLicenseKeyPolicyStatement],
      environment: {
        NEW_RELIC_ACCOUNT_ID: `"${newRelicAccountId}"`,
        NEW_RELIC_TRUSTED_ACCOUNT_KEY: `"${newRelicAccountId}"`,
        NEW_RELIC_LAMBDA_HANDLER: "lambda_function.lambda_handler",
        NEW_RELIC_LAMBDA_EXTENSION_ENABLED: "true",
        NEW_RELIC_DISTRIBUTED_TRACING_ENABLED: "true",
        NEW_RELIC_EXTENSION_SEND_FUNCTION_LOGS: "true",
        NEW_RELIC_SERVERLESS_MODE_ENABLED: "true",
        S3_BUCKET_NAME: bucket.bucketName,
      }
    });

    bucket.grantReadWrite(storerLambda);

    // Create Proxy Lambda
    const proxyLambda = new lambda.Function(this, LAMBDA_PROXY_NAME, {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, "../../../apps/proxy")),
      handler: "newrelic_lambda_wrapper.handler",
      logRetention: logs.RetentionDays.ONE_DAY,
      layers: [newrelicLayer],
      initialPolicy:[newRelicLicenseKeyPolicyStatement],
      environment: {
        NEW_RELIC_ACCOUNT_ID: `"${newRelicAccountId}"`,
        NEW_RELIC_TRUSTED_ACCOUNT_KEY: `"${newRelicAccountId}"`,
        NEW_RELIC_LAMBDA_HANDLER: "lambda_function.lambda_handler",
        NEW_RELIC_LAMBDA_EXTENSION_ENABLED: "true",
        NEW_RELIC_DISTRIBUTED_TRACING_ENABLED: "true",
        NEW_RELIC_EXTENSION_SEND_FUNCTION_LOGS: "true",
        NEW_RELIC_SERVERLESS_MODE_ENABLED: "true",
        LAMBDA_STORER_NAME: storerLambda.functionName,
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
