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