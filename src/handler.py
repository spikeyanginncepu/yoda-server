import tornado.ioloop
import tornado.web
import tornado.httpserver
import tornado.options
import logging
import tornado.gen
from tornado.concurrent import run_on_executor
from concurrent.futures import ThreadPoolExecutor   # `pip install futures` for python2
import json
from error import *

MAX_WORKERS = 20
backgroundActions= {'deleteUser', 'userFileAuthChange','tar','cp','changeTaskStatus','genResult','rmTask'}

class BaseHandler(tornado.web.RequestHandler):
    executor = ThreadPoolExecutor(max_workers=MAX_WORKERS)
    def get_current_user(self):
        username=self.get_secure_cookie("username")
        if not username:
            return None
        assert self.userCache is not None
        if type(self.userCache.get(username)) != str:
            return username

    def __init__(self,application,request,authCache=None,taskCache=None, modelCache=None,
                 fileCache=None,userCache=None,config=None,**kwargs):
        self.authCache=authCache
        self.taskCache=taskCache
        self.modelCache=modelCache
        self.fileCache=fileCache
        self.userCache=userCache
        self.config=config
        super(BaseHandler,self).__init__(application,request,**kwargs)
    '''
    @run_on_executor
    def background_task(self, i):
        """ This will be executed in `executor` pool. """
        time.sleep(10)
        return i

    @tornado.gen.coroutine
    def get(self, idx):
        """ Request that asynchronously calls background task. """
        res = yield self.background_task(idx)
        self.write(res)
    '''

class DefaultRedirectHandler(BaseHandler):
    def get(self,*args,**kwargs):
        self.redirect("/site/main.html")

class LoginHandler(BaseHandler):
    def get(self):
        self.render('login.html')
    def post(self):
        data={'username':self.get_argument('username'),'password':self.get_argument('pwd')}
        content = self.authCache.login(data)
        for name in content:
            self.set_secure_cookie(name, content[name], expires_days=self.config.login_expire_days)
        self.redirect(self.get_argument('next','site/main.html'))

class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("username")
        self.clear_all_cookies()
        self.redirect("/")

class AuthStaticFileHandler(BaseHandler,tornado.web.StaticFileHandler):
    def get_current_user(self):
        return BaseHandler.get_current_user(self)

    @tornado.web.authenticated
    def get(self,*args,**kwargs):
        return tornado.web.StaticFileHandler.get(self,*args,**kwargs)

class CommonRequestHandler(BaseHandler):
    @returnError()
    def getResult(self):
        cur_user = self.current_user()
        if self.action=='login':
            content=self.authCache.login(self.data)
            if not content:
                return {'status': 'failed'}
            for name in content:
                self.set_secure_cookie(name,content[name],expires_days=self.config.login_expire_days)
            return {'status':'ok'}
        elif self.action == 'changePassWord':
            isAdmin=self.userCache.get(cur_user,'authAdmin')
            cuser=self.userCache.get(self.data.username)
            oldpwd=self.data.get('oldPassword','')
            assert isAdmin or self.authCache.crypt(oldpwd,cuser['salt'])==cuser['password']
            return self.userCache.changePwd(self.data,cur_user)
        elif self.action == 'addUser':
            isAdmin = self.userCache.get(cur_user, 'authAdmin')
            assert isAdmin
            return self.userCache.addUser(self.data,cur_user)
        elif self.action == 'delUser':
            isAdmin = self.userCache.get(cur_user, 'authAdmin')
            assert isAdmin
            return self.userCache.delUser(self.data, cur_user)

    @run_on_executor()
    def getResultBackground(self):
        return self.getResult()

    @tornado.gen.coroutine
    def post(self,url):
        jsonContent=json.loads( self.request.body)
        self.action=jsonContent['action']
        self.data=jsonContent.get('data',None)





