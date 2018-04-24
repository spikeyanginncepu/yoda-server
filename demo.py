import tornado.ioloop
import tornado.web
import tornado.httpserver
import os,sys
curdir=os.path.dirname(os.path.abspath(__file__))
class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")

application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": "static","static_path":"static"}),
])

settings = {
    "xsrf_cookies": True,
    "static_path":'static'}

if __name__ == "__main__":
    server=tornado.httpserver.HTTPServer(application,ssl_options={
        "certfile":os.path.join(curdir,"ssl/auth.crt"),
        "keyfile":os.path.join(curdir,"ssl/auth.key")
        })
    server.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
