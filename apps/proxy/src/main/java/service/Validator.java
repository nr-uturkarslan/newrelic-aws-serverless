package service;

import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.Gson;
import dto.RequestDto;
import dto.ResponseDto;
import entity.Order;

import java.util.UUID;

public class Validator {

    private static final String REQUEST_BODY_NOT_PARSED =
            "message:Request body cannot be parsed.";
    private static final String ORDER_NAME_NOT_PROVIDED =
            "message:Order name is not provided.";
    private static final String ORDER_DESCRIPTION_NOT_PROVIDED =
            "message:Order description is not provided.";
    private static final String ORDER_UNIT_PRICE_NOT_PROVIDED =
            "message:Order unit price is not provided.";
    private static final String ORDER_AMOUNT_NOT_PROVIDED =
            "message:Order amount is not provided.";

    private final LambdaLogger logger;

    private final Gson gson = new Gson();

    public Validator(LambdaLogger logger) {
        this.logger = logger;
    }

    public APIGatewayProxyResponseEvent run(
            APIGatewayProxyRequestEvent input
    ) {

        var requestDto = parseRequestBody(input.getBody());
        if (requestDto == null || requestDto.getOrder() == null)
            return createFailedResponse(REQUEST_BODY_NOT_PARSED);

        return validateOrder(requestDto.getOrder());
    }

    private RequestDto parseRequestBody(
            String body
    ) {
        logger.log("message:Parsing input body...");
        try {
            return gson.fromJson(body, RequestDto.class);
        }
        catch (Exception e) {
            return null;
        }
    }

    private APIGatewayProxyResponseEvent validateOrder(
            Order order
    ) {
        logger.log("message:Validating order...");

        // Check name
        if (order.getName() == null)
            return createFailedResponse(ORDER_NAME_NOT_PROVIDED);

        // Check description
        if (order.getDescription() == null)
            return createFailedResponse(ORDER_DESCRIPTION_NOT_PROVIDED);

        // Check unit price
        if (order.getUnitPrice() == null)
            return createFailedResponse(ORDER_UNIT_PRICE_NOT_PROVIDED);

        // Check amount
        if (order.getAmount() == null)
            return createFailedResponse(ORDER_AMOUNT_NOT_PROVIDED);

        return createSuccessfulResponse(order);
    }

    private APIGatewayProxyResponseEvent createFailedResponse(
            String message
    ) {
        logger.log(message);

        var responseDto = new ResponseDto();
        responseDto.setMessage(message);

        var response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(400);
        response.setBody(gson.toJson(responseDto));

        return response;
    }

    private APIGatewayProxyResponseEvent createSuccessfulResponse(
            Order order
    ) {
        logger.log("message:Order received," +
                "orderName:"+order.getName() +
                "unitPrice:"+order.getUnitPrice() +
                "amount:"+order.getAmount());

        var responseDto = new ResponseDto();
        responseDto.setMessage("Order is valid.");
        responseDto.setCorrelationId(UUID.randomUUID().toString());
        responseDto.setOrderId(UUID.randomUUID().toString());

        var response = new APIGatewayProxyResponseEvent();
        response.setStatusCode(200);
        response.setBody(gson.toJson(responseDto));

        return response;
    }
}
