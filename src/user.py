from dataCache import dataCache
from auth import *

columnlist=['userid','name','salt','password','auth']
columnstr=columnlist[0]
for field in columnlist[1:]:
    columnstr=columnstr+','+field

class userCache(dataCache):
    def __init__(self,db,config,*args,**kwargs):
        super(userCache,self).__init__(*args,**kwargs)
        self.db=db
        self.authcodes=config.authEncode.userAuth
        for k,v in self.authcodes.items():
            self.authcodes[k]=int(v)

    def update(self,path,*args,**kwargs):
        curr=self.db.cursor()
        cc=dict()
        if path=='/':
            curr.execute('select name from users')
            cc['children']=[result[0] for result in curr.fetchall()]
        else:
            assert path.startwith('/')
            username=path[1:]
            curr.execute('select {} from users where name=%s'.format(columnstr),(username,))
            for idx,content in enumerate(curr.fetchone()):
                cc[columnlist[idx]]=content
            for authtype,authvalue in self.authcodes:
                cc[authtype]=bool(cc['authority'] & authvalue)
        self.cache[path]=cc

    def changeUser(self,content,currentUser):
        pass

    def changePwd(self,content,currentUser):
        pass

    def addUser(self,content,currentUser):
        pass

    def delUser(self,content,currentUser):
        pass