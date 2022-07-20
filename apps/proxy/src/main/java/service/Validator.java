package service;

import com.amazonaws.services.lambda.runtime.LambdaLogger;
import dto.ResponseDto;
import entity.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

public class Validator {

    private static final String ORDER_NOT_PROVIDED =
            "message:Order is not provided.";
    private static final String ORDER_NAME_NOT_PROVIDED =
            "message:Order name is not provided.";
    private static final String ORDER_DESCRIPTION_NOT_PROVIDED =
            "message:Order description is not provided.";
    private static final String ORDER_UNIT_PRICE_NOT_PROVIDED =
            "message:Order unit price is not provided.";
    private static final String ORDER_AMOUNT_NOT_PROVIDED =
            "message:Order amount is not provided.";

    private final LambdaLogger logger;

    public Validator(LambdaLogger logger) {
        this.logger = logger;
    }

    public ResponseEntity<ResponseDto> run(Order order) {
        logger.log("message:Validating order...");

        // Check object
        if (order == null)
            return createFailedResponse(ORDER_NOT_PROVIDED);

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

    private ResponseEntity<ResponseDto> createFailedResponse(
            String message
    ) {
        logger.log(message);

        var responseDto = new ResponseDto();
        responseDto.setMessage(message);

        return new ResponseEntity<ResponseDto>(responseDto, HttpStatus.BAD_REQUEST);
    }

    private ResponseEntity<ResponseDto> createSuccessfulResponse(
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

        return new ResponseEntity<ResponseDto>(responseDto, HttpStatus.OK);
    }
}
