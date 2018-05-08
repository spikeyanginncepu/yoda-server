import tornado.ioloop
import tornado.web
import tornado.httpserver
import os,sys
import tornado.options
import logging
import signal

curdir=os.path.dirname(os.path.abspath(__file__))

is_closing = False

def signal_handler(signum, frame):
    global is_closing
    logging.info('exiting...') 
    is_closing = True

def try_exit(): 
    global is_closing 
    if is_closing:
        # clean up here 
        tornado.ioloop.IOLoop.instance().stop() 
        logging.info('exit success')

class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("username")

class LoginHandler(BaseHandler):
    def get(self):
        self.render('login.html')
    def post(self):
        self.set_secure_cookie("username", self.get_argument("username"))
        self.redirect(self.get_argument('next','site/main.html'))

class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("username")
        self.redirect("/")

class DefaultRedirectHandler(BaseHandler):
    def get(self,*args,**kwargs):
        self.redirect("/site/main.html")

class AuthStaticFileHandler(BaseHandler,tornado.web.StaticFileHandler):
    def get_current_user(self):
        return BaseHandler.get_current_user(self)

    @tornado.web.authenticated
    def get(self,*args,**kwargs):
        return tornado.web.StaticFileHandler.get(self,*args,**kwargs)
    @tornado.web.authenticated
    def post(self,*args,**kwargs):
        return tornado.web.StaticFileHandler.get(self,*args,**kwargs)

if __name__ == "__main__":
    with open(os.path.join(curdir,'ssl/password1.txt')) as f:
        cookie_secret=f.read().strip()
    tornado.options.parse_command_line() 
    signal.signal(signal.SIGINT, signal_handler)
    settings = {
        "template_path": os.path.join(os.path.dirname(__file__), "public"),
        "cookie_secret": cookie_secret,
        "xsrf_cookies": True,
        "login_url": "/p/login",
        "static_path":"public"
    }

    application = tornado.web.Application([
        (r'/p/login', LoginHandler),
        (r'/logout', LogoutHandler),
        (r'/data/(.*?)$', AuthStaticFileHandler,{'path':os.path.join(curdir,'data')}),
        (r'/site/(.*?)$', AuthStaticFileHandler, {'path': os.path.join(curdir, 'static')}),
        (r'/p/(.*?)$', tornado.web.StaticFileHandler,{'path':os.path.join(curdir,'public')}),
        (r'/(.*?)$', DefaultRedirectHandler),
    ], **settings)

    server=tornado.httpserver.HTTPServer(application,ssl_options={
        "certfile":os.path.join(curdir,"ssl/auth.crt"),
        "keyfile":os.path.join(curdir,"ssl/auth.key")
        })

    port=8888 if len(sys.argv)<=1 else int(sys.argv[1])
    server.listen(port)
    tornado.ioloop.PeriodicCallback(try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()
