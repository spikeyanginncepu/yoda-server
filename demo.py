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
        self.redirect("main.html")


class WelcomeHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render('main.html', user=self.current_user)

class LogoutHandler(BaseHandler):
    def get(self):
        if (self.get_argument("logout", None)):
            self.clear_cookie("username")
            self.redirect("/")


class DemoHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")


class AuthStaticFileHandler(BaseHandler,tornado.web.StaticFileHandler):
    def get_current_user(self):
        return BaseHandler.get_current_user(self)

    @tornado.web.authenticated
    def get(self,*args,**kwargs):
        return tornado.web.StaticFileHandler.get(self,*args,**kwargs)

if __name__ == "__main__":
    tornado.options.parse_command_line() 
    signal.signal(signal.SIGINT, signal_handler)
    settings = {
        "template_path": os.path.join(os.path.dirname(__file__), "static"),
        "cookie_secret": "bZJc2sWbQLKos6GkHn/VB9oXwQt8S0R0kRvJ5/xJ89E=",
        "xsrf_cookies": True,
        "login_url": "/login",
        "static_path": os.path.join(curdir,'static')
    }

    application = tornado.web.Application([
        #(r'/', WelcomeHandler),
        (r'/login', LoginHandler),
        (r'/logout', LogoutHandler),
        (r'/data/(.*?)$', AuthStaticFileHandler,{'path':os.path.join(curdir,'data')}),
        (r'/(.*?)$', tornado.web.StaticFileHandler,{'path':os.path.join(curdir,'static'),'default_filename':'static/main.html'})
    ], **settings)


    server=tornado.httpserver.HTTPServer(application,ssl_options={
        "certfile":os.path.join(curdir,"ssl/auth.crt"),
        "keyfile":os.path.join(curdir,"ssl/auth.key")
        })
    server.listen(8888)
    tornado.ioloop.PeriodicCallback(try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()
