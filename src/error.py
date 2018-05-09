import traceback

class ServerError(Exception):
    pass

class NotLoggedIn(ServerError):
    pass

class Expired(ServerError):
    pass

class OtherError(ServerError):
    pass

def returnError(fun):
    def wrapper(*args,**kwargs):
        try:
            return fun(*args,**kwargs)
        except Exception as t:
            return {
                'status': str(type(t)).split('\'')[1],
                'failedReason': str(t),
                'traceback': traceback.format_exc()
            }
    return wrapper

