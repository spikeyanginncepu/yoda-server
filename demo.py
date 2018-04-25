import tornado.ioloop
import tornado.web
import tornado.httpserver
import os,sys
import tornado.options
curdir=os.path.dirname(os.path.abspath(__file__))


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("username")


class LoginHandler(BaseHandler):
    def get(self):
        self.render('login.html')
    def post(self):
        self.set_secure_cookie("username", self.get_argument("username"))
        self.redirect("/")


class WelcomeHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render('index.html', user=self.current_user)


class LogoutHandler(BaseHandler):
    def get(self):
        if (self.get_argument("logout", None)):
            self.clear_cookie("username")
            self.redirect("/")


class DemoHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")



class MyStaticFileHandler(tornado.web.StaticFileHandler,BaseHandler):
   @tornado.web.authenticated
   def _get(self, path, include_body=True):
       return self.get(path,include_body)
   get=_get

if __name__ == "__main__":
    tornado.options.parse_command_line()

    settings = {
        "template_path": os.path.join(os.path.dirname(__file__), "static"),
        "cookie_secret": "bZJc2sWbQLKos6GkHn/VB9oXwQt8S0R0kRvJ5/xJ89E=",
        "xsrf_cookies": True,
        "login_url": "/login",
        "static_path": os.path.join(curdir,'static')
    }

    application = tornado.web.Application([
        (r'/', WelcomeHandler),
        (r'/login', LoginHandler),
        (r'/logout', LogoutHandler),
        (r'/(.*?)$', tornado.web.StaticFileHandler,{'path':os.path.join(curdir,'static'),'default_filename':'index.html'})
    ], **settings)


    server=tornado.httpserver.HTTPServer(application,ssl_options={
        "certfile":os.path.join(curdir,"ssl/auth.crt"),
        "keyfile":os.path.join(curdir,"ssl/auth.key")
        })
    server.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
