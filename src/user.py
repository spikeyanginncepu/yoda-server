from dataCache import dataCache
import auth

columnlist=['userid','username','salt','password','authority']
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
        self.authMask=(1 << len(self.authcodes)) -1

    def update(self,path,*args,**kwargs):
        curr=self.db.cursor()
        cc=dict()
        if path=='/':
            curr.execute('select username from users')
            cc['children']=[result[0] for result in curr.fetchall()]
        else:
            assert path.startswith('/')
            username=path[1:]
            curr.execute('select {} from users where username=%s'.format(columnstr),(username,))
            line=curr.fetchone()
            if line is None:
                cc='notExist'
            else:
                for idx,content in enumerate(line):
                    cc[columnlist[idx]]=content
                for authtype,authvalue in self.authcodes.items():
                    cc[authtype]=bool(cc['authority'] & authvalue)
        self.cache[path]=cc
        curr.close()

    def whoimi(self,currentUser):
        result=dict()
        result['status']='ok'
        result['username']=currentUser
        cache=self.get('/'+currentUser)
        result['authority']=dict()
        for authtype, authvalue in self.authcodes.items():
            result['authority'][authtype]=cache[authtype]
        result['config']=dict()
        result['config']['color']=cache['color']
        result['config']['font']=cache['font']
        return result

    def changeUser(self,data,currentUser):
        maskOr=0
        maskAnd=(1 << len(self.authcodes)) - 1
        for k, v in self.authcodes.items():
            targetValue=data.get(k,'mixed').lower()
            if targetValue=='true':
                maskOr = maskOr | v
            elif targetValue=='false':
                maskAnd = maskAnd & (self.authMask ^ v)
        cursor=self.db.cursor()
        for name in data['username']:
            user = self.get('/' + name)
            userAuth=(user['authority'] | maskOr) & maskAnd
            cursor.execute("""update users set authority = %s where userid = %s""",(user['userid'],userAuth))
            self.update('/'+name)
        cursor.close()
        result={'status':'ok'}
        return result

    def changePwd(self,data,currentUser):
        user = self.get('/'+data['username'])
        cursor=self.db.cursor()
        salt= auth.genSalt()
        pwd= auth.crypt(data['newPassword'],salt)
        cursor.execute('update users set salt = %s, password = %s where userid = %s',(salt,pwd,user['userid']))
        self.update('/'+data['username'])
        cursor.close()
        result = {'status': 'ok'}
        return result

    def addUser(self,data,currentUser):
        cursor = self.db.cursor()
        authcode=0
        for k, v in self.authcodes.items():
            authcode += v if data.get(k,'false').lower()=='true' else 0

        username=data['username']
        assert type(self.get('/' + username)) == str
        color=data.get('color','')
        font=data.get('font','')
        salt=auth.genSalt()
        pwd=auth.crypt(data['password'],salt)
        cursor.execute('insert into users (username,password,salt,authority,font,color) values (%s,%s,%s,%s,%s,%s)',
                       (username,pwd,salt,authcode,font,color))
        cursor.close()
        self.rmCache('/'+username)
        result = {'status': 'ok'}
        return result

    def delUser(self,data,currentUser):
        cursor = self.db.cursor()
        username = data['username']
        user=self.get('/'+username)
        cursor.execute('delete from users where userid = %s',(user['userid'],))
        cursor.close()
        result = {'status': 'ok'}
        return result