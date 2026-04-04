import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from app.core.security import decode_access_token

logger = logging.getLogger("kuriftuos")

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        
        # 1. Start timer
        start_time = time.time()

        # 2. Extract Authorization header
        auth_header = request.headers.get("Authorization")
        
        request.state.user = None
        
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_access_token(token)
            if payload:
                request.state.user = payload # Attach simple payload to request state

        # 3. Process request
        response = await call_next(request)

        # 4. Add custom headers or logging
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        logger.info(
            f"Method: {request.method} | Path: {request.url.path} | Time: {process_time:.4f}s"
        )
        
        return response
