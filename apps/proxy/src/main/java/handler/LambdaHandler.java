package handler;

import com.amazonaws.services.lambda.runtime.Context;
import dto.RequestDto;
import dto.ResponseDto;
import org.springframework.http.ResponseEntity;
import service.Validator;

public class LambdaHandler {

    public ResponseEntity<ResponseDto> handleRequest(
            RequestDto requestDto,
            Context context
    ) {

        var validator = new Validator(context.getLogger());
        return validator.run(requestDto.getOrder());
    }
}
