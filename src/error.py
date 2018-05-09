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
            traceback.print_exc()
            return {
                'status': str(type(t)).split('\'')[1],
                'failedReason': str(t),
            }
    return wrapper

