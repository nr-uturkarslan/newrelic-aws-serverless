import os
import json
import boto3

def prepareResponse(statusCode, message):
  response = {
    "statusCode": statusCode,
    "body": json.dumps(
      {
        "message": message
      }
    ),
  }

  print(response)
  return response

def lambda_handler(event, context):

  requestBody = json.loads(event["body"])

  try:
    # Send payload to storer lambda
    print("Performing request to storer lambda...")
    storerResponse = boto3.client("lambda").invoke(
      FunctionName = os.getenv('STORER_LAMBDA_NAME'),
      InvocationType = "RequestResponse",
      Payload = json.dumps(requestBody)
    )
    print("Request is performed to storer lambda successfully.")
  except Exception as e:
    print(e)
    return prepareResponse(500, "Request to storer lambda is failed.")

  try:
    payload = json.loads(storerResponse["Payload"].read())
  except Exception as e:
    print(e)
    return prepareResponse(500, "Storer response is failed to be parsed.")

  if payload.get("body").get("success"):
    statusCode = 200
  else:
    statusCode = 400

  return prepareResponse(
    statusCode,
    payload.get("body").get("message")
  )
