import tornado.ioloop
import tornado.web
import tornado.httpserver
import os,sys
import tornado.options
import logging
import signal
import tornado.gen
import argparse
from utils.load_config import load_config,update_config

''' =========main===========  '''

curdir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
odir = os.path.abspath('.')
sys.path.insert(os.path.join(curdir, 'src'), 0)
os.chdir(curdir)

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


ctparser = argparse.ArgumentParser(description='yoda-server main application')
ctparser.add_argument('-c', '--conf', type=str, help='main conf yaml file, default conf/server.yaml', default='')
ctparser.add_argument('-p', '--port', type=int, help='the port the server listening to', default=-1)
ctparser.add_argument('-o', '--override', type=str, help='options override the conf file, eg: a=c;b.B=d', default='')


def server(argv):
    args = ctparser.parse_args(argv)
    confFile = 'conf/server.yaml' if len(args.conf) == 0 else args.conf
    config = load_config('conf/server.yaml.template')
    config_new = load_config(confFile)
    update_config(config, config_new)
    if len(args.override) > 0:
        for line in args.override.split(';'):
            exec('config.' + line)
    if args.port > 0:
        config.tornado.port = args.port

    signal.signal(signal.SIGINT, signal_handler)
    settings = {
        "template_path": os.path.join(os.path.dirname(__file__), "public"),
        "cookie_secret": config.tornado.secret,
        "xsrf_cookies": config.tornado.xsrf,
        "login_url": "/p/login",
        "static_path": "public"
    }
    import handler
    from auth import authFuncs
    from file import fileCache
    from model import modelCache
    from task import taskCache
    from user import userCache
    from utils.conn2db import conn2db
    conn = conn2db(config)
    cfile = fileCache(conn, config)
    cmodel = modelCache(conn, config)
    ctask = taskCache(conn, config)
    cuser = userCache(conn, config)
    cauth = authFuncs(conn, config, cfile, cuser, ctask, cmodel)

    RSettings = {'authCache': cauth,
                 'userCache': cuser,
                 'taskCache': ctask,
                 'modelCache': cmodel,
                 'fileCache': cfile,
                 'config': config.tornado
                 }

    application = tornado.web.Application([
        (r'/p/login', handler.LoginHandler),
        (r'/logout', handler.LogoutHandler),
        (r'(/request|/auth)$', handler.CommonRequestHandler, RSettings),
        (r'/data/(.*?)$', handler.AuthStaticFileHandler, {'path': os.path.join(curdir, 'data')}),
        (r'/site/(.*?)$', handler.AuthStaticFileHandler, {'path': os.path.join(curdir, 'static')}),
        (r'/p/(.*?)$', tornado.web.StaticFileHandler, {'path': os.path.join(curdir, 'public')}),
        (r'/(.*?)$', handler.DefaultRedirectHandler),
    ], **settings)

    server = tornado.httpserver.HTTPServer(application, ssl_options={
        "certfile": os.path.join(curdir, "ssl/auth.crt"),
        "keyfile": os.path.join(curdir, "ssl/auth.key")
    })

    port = 8888 if len(sys.argv) <= 1 else int(sys.argv[1])
    server.listen(port)
    tornado.ioloop.PeriodicCallback(try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    server(sys.argv[1:])
