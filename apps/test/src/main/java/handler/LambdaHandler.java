package handler;

import com.amazonaws.services.lambda.runtime.Context;

public class LambdaHandler {
    public String handleRequest(String input, Context context) {
        context.getLogger().log(input);
        return input;
    }
}
