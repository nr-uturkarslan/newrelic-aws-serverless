package handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;

import io.opentracing.util.GlobalTracer;
import service.Validator;

public class LambdaHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    @Override
    public APIGatewayProxyResponseEvent handleRequest(
            APIGatewayProxyRequestEvent input,
            Context context
    ) {
        final var tracer = GlobalTracer.get();

        APIGatewayProxyResponseEvent response;

        // This is an example of a custom span. `FROM Span SELECT * WHERE name='MyLambdaJavaSpan'` in New Relic will find this event.
        var customSpan = tracer.buildSpan("MyLambdaJavaSpan").start();
        try (var scope = tracer.activateSpan(customSpan)) {

            // Here, we add a tag to our custom span
            customSpan.setTag("lambdaCustomTagKey", "lambdaCustomAttrVal");

            var validator = new Validator(context.getLogger());
            response = validator.run(input);
        }
        finally {
            customSpan.finish();
        }

        // This tag gets added to the function invocation's root span, since it's active.
        tracer.activeSpan().setTag("lambdaCustomAttrKey", "lambdaCustomAttrVal");

        return response;
    }
}
