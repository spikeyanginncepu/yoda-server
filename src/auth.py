import base64
import hashlib
import os
import sys
def crypt(pwd,salt):
    if sys.version[0]=='3':
        if type(pwd)==str:
            pwd=pwd.encode('utf-8')
        if type(salt)==str:
            salt=salt.encode('utf-8')
    times = 250
    sha512 = hashlib.sha512()
    sha512.update(salt)
    sha512.update(pwd)
    for i in range(times):
        sha512.update(sha512.digest())
    result= base64.b64encode(sha512.digest())[0:64]
    if sys.version[0]=='3':
        result=result.decode('utf-8')
    return result

def genSalt(n=12):
    result=base64.b64encode(os.urandom(n))
    if sys.version[0]=='3':
        result=result.decode('utf-8')
    return result

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