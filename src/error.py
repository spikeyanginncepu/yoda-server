
class ServerError(Exception):
    pass

class NotLoggedIn(ServerError):
    pass

class Expired(ServerError):
    pass

class OtherError(ServerError):
    pass

def returnError():
    def wrapper(fun,*args,**kwargs):
        try:
            return fun(*args,**kwargs)
        except Exception as t:
            return {
                'status': str(type(t)).split('\'')[1],
                'failedReason': str(t),
            }
    return wrapper

