import base64
import hashlib
import os

def crypt(pwd,salt):
    times = 250
    sha512 = hashlib.sha512()
    sha512.update(salt)
    sha512.update(pwd)
    for i in range(times):
        sha512.update(sha512.digest())
    return base64.b64encode(sha512.digest())[0:64]

def genSalt(n=12):
    return base64.b64encode(os.urandom(n))

class authFuncs:
    def __init__(self,db,config,fileCache,userCache,taskCache,modelCache):
        self.db=db
        self.fileCache=fileCache
        self.userCache=userCache
        self.taskCache=taskCache
        self.modelCache=modelCache
        self.authcode=config.authEncode
        self.genSalt=genSalt
        self.crypt=crypt
    def login(self,data):
        username=data['username']
        password=data['password']
        udata=self.userCache.get('/'+username)
        if type(udata)==str:
            salt=''
            pwdIndb=''
        else:
            salt=udata['salt']
            pwdIndb=udata['password']
        if crypt(password,salt) == pwdIndb:
            return {'username':username}
        else:
            return False