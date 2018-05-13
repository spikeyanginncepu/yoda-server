import os,sys,re
import error
from dataCache import dataCache
import mimetypes
'''["fileName","type","filesContain","size","dateModified","children","authRead","authWrite","usedByTask"]'''

class fileCache(dataCache):
    def __init__(self,db,config,*args,**kwargs):
        super(fileCache,self).__init__(*args,**kwargs)
        self.db=db
        self.result='识别结果'
        self.root=config.tornado.dataPath
        if self.root.endswith('/'):
            self.root=self.root[:-1]
        self.taskAuthcode=config.authEncode.taskAuth
        self.fileAuthcode=config.authEncode.fileAuth
        self.fileAuthMask=(1 << len(self.fileAuthcode))-1
        self.tasksqlstr='''select distinct users.username from taskauth,users,tasks where taskauth.authority & {} >0 and input = %s'''.format(
                        self.taskAuthcode.isOwner | self.taskAuthcode.canModify)
        self.dreadsqlstr='''select distinct users.username from dauth,users where authority & {} > 0 and path = %s '''.format(
            self.fileAuthcode.authRead
        )
        self.dwritesqlstr = '''select distinct users.username from dauth,users where authority & {} > 0 and path = %s '''.format(
            self.fileAuthcode.authWrite
        )
    def update(self,path,*args,**kwargs):
        if len(path)>1 and path.endswith('/'):
            path=path[:-1]
        realpath=self.root+path
        cc=dict()
        pathList=re.split(r'[/\\]+',path)

        '''infer name'''
        if path=='/':
            cc['fileName']='/'
        else:
            cc['fileName']=pathList[-1]

        '''guess type'''
        if os.path.isdir(realpath):
            cc['type']='userFolder' if len(pathList)<=2 and cc['fileName'].startswith('用户-') else 'folder'
        else:
            type=mimetypes.guess_type(realpath)[0]
            if type is not None:
                type=type.split('/')[0]
            cc['type']=type

        if cc['type']=='folder' or cc['type']=='userFolder':
            cc['children']=os.listdir(realpath)
            cc['size']=''
            cc['filesContain']=len(cc['children'])
        else:
            cc['size']=os.path.getsize(realpath)
            cc['filesContain']=''

        cc['dateModified']=os.path.getmtime(realpath)

        cursor=self.db.cursor()

        if path == '/':
            cursor.execute('''select username from users''')
            cc['authRead'] = set([j[0] for j in cursor.fetchall()])
            cc['authWrite'] = set()
        else:
            if pathList[1]==self.result:
                if len(pathList)==2:
                    parent = self._get('/')
                    cc['authRead'] = parent['authRead']
                    cc['authWrite'] = parent['authWrite']
                elif len(pathList)==3:
                    cursor.execute(self.tasksqlstr,(path,))
                    cc['authRead'] = set([j[0] for j in cursor.fetchall()])
                    cc['authWrite'] = set()
                else:
                    parent=self._get('/{}/{}'.format(pathList[1],pathList[2]))
                    cc['authRead']=parent['authRead']
                    cc['authWrite']=parent['authWrite']
            else:
                if len(pathList)==2:
                    cursor.execute(self.dreadsqlstr,(path,))
                    cc['authRead']=set([j[0] for j in cursor.fetchall()])
                    cursor.execute(self.dwritesqlstr, (path,))
                    cc['authWrite']=set([j[0] for j in cursor.fetchall()])
                else:
                    parent=self._get('/'+pathList[1])
                    cc['authRead']=parent['authRead']
                    cc['authWrite']=parent['authWrite']

        # usedByTask
        cursor.execute('select taskid from tasks where input= %s',(path,))
        cc['usedByTask']=True if cursor.fetchone() is not None else False
        self.cache[path]=cc
        cursor.close()

    def userFileAuthChange(self,data,userobj,currentUser):
        cursor=self.db.cursor()
        for file in data['files']:
            path=file['fileName']
            authRead=file['authRead']
            authWrite=file['authWrite']
            assert not (authWrite=='mixed' and authRead == 'false')
            assert not (authWrite=='false' and authRead != 'false')
            if path.endswith('/'):
                path=path[:-1]
            pathList=path.split('/')
            assert len(pathList)==2 and pathList[1] != self.result
            for username in data['asUser']:
                userid=userobj.get(username,'userid')
                cursor.execute('select authority from dirauth where path = %s and userid = %s',
                               (path,userid))
                result=cursor.fetchone()
                if result==None:
                    value=0
                    if authRead=='true':
                        value=value | self.fileAuthcode.authRead
                    if authWrite=='true':
                        value=value | self.fileAuthcode.authWrite
                    cursor.execute('insert into dirauth (path,userid,authority) values (%s,%s,%s)',(path,userid,value))
                else:
                    value=result[0]
                    for tarvalue,status in ((self.fileAuthcode.authRead,authRead),(self.fileAuthcode.authWrite,authWrite)):
                        if status == 'true':
                            value=value | tarvalue
                        elif status == 'false':
                            value= value & (self.fileAuthMask ^ tarvalue)
                    cursor.execute('update dirauth set authority = %s where path= %s and userid=%s',(value,path,userid))
        result={'status':'ok'}
        return result

    def mkdir(self,data,currentUser):
        raise NotImplementedError

    def tar(self,data,currentUser):
        raise NotImplementedError

    def rename(self,data,currentUser):
        raise NotImplementedError

    def rm(self,data,currentUser):
        raise NotImplementedError

    def mv(self,data,currentUser):
        raise NotImplementedError




