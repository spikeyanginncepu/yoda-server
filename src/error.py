
class ServerError(Exception):
    pass

class NotLoggedIn(ServerError):
    pass

class Expired(ServerError):
    pass

class OtherError(ServerError):
    pass
