"""
Vercel serverless entrypoint for the Agro Sensei Flask backend.

This wraps the existing `backend.app:app` Flask application using
`vercel_serverless_wsgi` so that it can run as a Vercel Python function.
"""

from vercel_serverless_wsgi import handle_request

from backend.app import app


def handler(event, context):
    """
    AWS Lambda style handler used by Vercel's Python runtime.

    `event` and `context` are provided by the platform and are translated
    to a WSGI request by `handle_request`.
    """
    return handle_request(app, event, context)

