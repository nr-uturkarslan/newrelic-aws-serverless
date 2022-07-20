import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create Proxy Lambda
    const proxyLambda = new lambda.Function(this, "proxy", {
      runtime: Runtime.JAVA_11,
      code: lambda.Code.fromAsset(path.join(__dirname, "../../../apps/proxy/target/proxy.jar")),
      handler: "handler.LambdaHandler::handleRequest",
    });
  }
}
