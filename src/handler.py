from concurrent.futures import ThreadPoolExecutor
from tornado.ioloop import IOLoop
from tornado.concurrent import run_on_executor
import tornado.web
import tornado.gen
from error import *



class NormalPost:
    def _get_current_user(self,handler,*args,**kwargs):
        return handler.get_secure_cookie('username')
    def _do_auth(self,handler,*args,**kwargs):
        return handler.get_secure_cookie("username")
    def _process_request(self,handler,*args,**kwargs):
        return handler.get_secure_cookie("username")
    def _post_response(self,handler,*args,**kwargs):
        return handler.get_secure_cookie("username")

    def _post_error(self,handler,*args,**kwargs):
        pass
    def __call__(self, RequestHandler,*args,**kwargs):
        try:
            RequestHandler.response = {}
            self._get_current_user(RequestHandler, *args, **kwargs)
            self._do_auth(RequestHandler, *args, **kwargs)
            self._process_request(RequestHandler, *args, **kwargs)
            self._post_response(RequestHandler, *args, **kwargs)
        except:
            self._post_error(RequestHandler, *args, **kwargs)


class CommonRequestHandler(tornado.web.RequestHandler):
    executor = ThreadPoolExecutor(30)

    @tornado.web.asynchronous
    @tornado.gen.coroutine
    def get(self):
        res = yield self.sleep()
        self.write("when i sleep %f s" % (time.time() - start))
        self.finish()

    @run_on_executor
    def sleep(self):
        time.sleep(5)
        return 5