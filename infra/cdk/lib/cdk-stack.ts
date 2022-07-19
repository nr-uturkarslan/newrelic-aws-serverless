import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new lambda.Function(this, "my-test-lambda", {
      runtime: Runtime.JAVA_11,
      code: lambda.Code.fromAsset("src/test.jar"),
      handler: "handler.LambdaHandler::handleRequest",
    });
  }
}
