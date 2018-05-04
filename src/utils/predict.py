#!/usr/bin/env python2
# coding=utf-8



import argparse
import os
import sys
from threading import Lock


this_dir = os.path.dirname(__file__)
cur_dir = os.path.abspath('.')
if len(this_dir) > 0:
    os.chdir(this_dir)
sys.path.insert(0,'include')
from PIL import Image,ImageDraw,ImageFont

import random
import numpy as np
import cv2
from threading import Lock
from concurrent.futures import thread
from lib.utils.location import location
import time
import mimetypes
import traceback
import tempfile

if sys.version[0] == '3':
    xrange=range

salt = 'sa:'
colordict={u'缺销子':'rgb(230,179,0)',
           u'绝缘子（损坏部分）':'rgb(204,26,0)',
           u'鸟巢':'rgb(255,128,26)',
           u'地线光缆（悬吊式）':'rgb(51,128,204)',
           u'防震锤（安装不规范）':'rgb(255,100,0)',
           '缺销子':'rgb(230,179,0)',
           '绝缘子（损坏部分）':'rgb(204,26,0)',
           '鸟巢':'rgb(255,128,26)',
           '地线光缆（悬吊式）':'rgb(51,128,204)',
           '防震锤（安装不规范）': 'rgb(255,100,0)'}
fontDict=dict()
tl=Lock()

myfont = 'lib/fonts/NotoSansCJK-Black.ttc'

def print_boxes(im,outpath, dets, printthresh=None):

    if type(im) == str:
        im = Image.open(im)

    width=im.width
    height=im.height
    draw=ImageDraw.ImageDraw(im)

    mfontsize = int(min(100, max(8, int(max(width, height) / 1000.0 * 14))) / 2)
    if (mfontsize not in fontDict):
        tl.acquire()
        fontDict[mfontsize] = ImageFont.truetype(font=myfont, size=mfontsize*2)
        tl.release()
    font=fontDict[mfontsize]


    for det in dets:
        prob = det.prob if det.prob is not None else 0
        cls_name=det.cls
        if(cls_name not in colordict):
            tl.acquire()
            random.seed(salt + cls_name)
            color = np.array([random.random(), random.random(), random.random()])
            color = color - color.min()
            color = color / color.max()*255.0
            color = tuple(color.astype('i'))
            colordict[cls_name]='rgb({},{},{})'.format(*color)
            tl.release()

        color = colordict[cls_name]

        if printthresh==None or printthresh <= prob:

            det_loc=location(relloc=(det.xc,det.yc,det.w,det.h),picsize=(width,height))
            absloc=det_loc.getabsloc()
            det_w=absloc[2]-absloc[0]
            det_h=absloc[3]-absloc[1]

            outputfmt = '{name:s} .{prob:02}' if type(cls_name) == str else u'{name:s} .{prob:02}'
            outputstr=outputfmt.format(name=cls_name, prob=int(100 * prob))

            linewidth = int(max(4, min(max(width, height) / 480.0,max(det_w, det_h) / 100.0)))
            str_w,str_h=draw.textsize(text=outputstr,font=font)
            xy = (absloc[0], absloc[1]) if absloc[1] < linewidth + str_h else (absloc[0], absloc[1] - linewidth - str_h)

            draw.text(xy=xy, text=outputstr, fill=color, font=font)
            for offset in xrange(linewidth):
                draw.rectangle((absloc[0]-offset,absloc[1]-offset, absloc[2]+offset,absloc[3]+offset),outline=color)

    im.save(outpath,quality=95,compress_level=1)


def message2csv(dets,name='',frame=''):
    strList=['{},{},{},{},{},{},{},{}\n'.format(name,frame,det.cls if type(det.cls)==str else det.cls.encode('utf-8'),
                                              det.xc,det.yc,det.w,det.h,det.prob) for det in dets]
    return ''.join(strList)


ctparser = argparse.ArgumentParser(description='predict images/videos and output csv/labeled image/video '
                                               +'using drfcn service')
ctparser.add_argument('model',type=str,help='model for prediction')
ctparser.add_argument('action', type=str,help='image/images/video/videos')
ctparser.add_argument('-i', '--input', required=True, type=str, help='input folders or files',default='')
ctparser.add_argument('-o', '--output', type=str, help='output folders or files',default='')
ctparser.add_argument('-c', '--csv', type=str, help = 'csv file for output prediction information',default='')
ctparser.add_argument('-t', '--printthresh', type=float,default=0.0,help='only box with prob larger than this argument will be output')
ctparser.add_argument('-p','--priority',type=int,help='predicting priority, the small, the more emergency,default is 5',default=5)
ctparser.add_argument('-f', '--fps', type=str, help='FPS for output video',default='')
ctparser.add_argument('-r', '--retry', type=int, help='Maximum retry time on failure',default=2)
ctparser.add_argument('-C','--config',type=str,help='config yaml location,default is ../conf/servers.yaml',default='')
ctparser.add_argument('-x','--xsize',type=str,help='output xsize prediction file',default='')

class videoprocess:
    def __init__(self,input,output,fps=''):
        self.tmpdir=tempfile.mkdtemp(prefix='tmp_drfcn_', dir='/dev/shm')
        self.indir=os.path.join(self.tmpdir,'input')
        self.outdir=os.path.join(self.tmpdir,'output')
        os.mkdir(self.indir,0711)
        os.mkdir(self.outdir,0711)
        self.inputpath=input
        self.outputpath=output
        if  len(fps) > 0:
            self.fps = fps
        else:
            fpscmd = '''ffmpeg -i {} 2> /dev/stdout | grep -o -E "[0-9.]* fps" | grep -o -E "[0-9.]*"'''
            with os.popen(fpscmd.format(input)) as fid:
                self.fps = fid.read().strip()
    def getFrames(self):
        imagelist=[]
        v2icmd = '''ffmpeg -i {} -y -r {} -f image2 {}/movie-%05d.bmp'''.format(self.inputpath, self.fps, self.indir)
        os.system(v2icmd)
        for name in os.listdir(self.indir):
            rl=mimetypes.guess_type(name)
            if rl[0] is not None and rl[0].startswith('image'):
                imagelist.append((os.path.join(self.indir,name), self.outdir))
        return imagelist

    def getVideo(self):
        i2vcmd = '''ffmpeg -f image2 -r {} -i {}/movie-%05d.bmp -y -codec copy -vcodec libx264 -r {} {}'''.format(
            self.fps, self.outdir, self.fps, self.outputpath)
        print i2vcmd
        os.system(i2vcmd)

    def __del__(self):
        os.system('rm -rf "{}"'.format(self.tmpdir))


def predict(argv):
    import redisclient
    from load_config import load_config
    args = ctparser.parse_args(argv)
    conf = load_config('../conf/servers.yaml' if len(args.config)==0 else os.path.join(cur_dir,args.config))
    rc = redisclient.predictClient(conf)

    def predAndDraw(target, args):
        try:
            result = rc.sendRequest(args.model, target[0], priority=args.priority, thresh=args.printthresh)
            assert result.status == 0, 'Invalid response!'
            if target[1] is not None:
                print_boxes(target[0], os.path.join(target[1], os.path.basename(target[0])), result.dets,
                            args.printthresh)
        except Exception:
            return (None, target)
        return (result, target)

    csvfile=open(os.path.join(cur_dir,args.csv),'w') if len(args.csv) > 0 else None
    xsfile=open(os.path.join(cur_dir,args.xsize),'w') if len(args.xsize)> 0 else None
    outpath=os.path.join(cur_dir,args.output) if len(args.output)>0 else None
    if outpath is not None and not os.path.exists(outpath):
        os.makedirs(outpath)

    imagelist=[]
    videolist=[]
    args.input=os.path.join(cur_dir,args.input)

    if args.action=='image':
        imagelist.append((args.input, outpath))
    elif args.action=='images':
        for name in os.listdir(args.input):
            rl=mimetypes.guess_type(name)
            if rl[0] is not None and rl[0].startswith('image'):
                imagelist.append((os.path.join(args.input,name), outpath))
    elif args.action=='video':
        videolist.append(videoprocess(os.path.join(cur_dir,args.input),
                                      os.path.join(cur_dir,args.output,os.path.basename(args.input)),
                                      args.fps))
    else:
        raise NotImplementedError

    for video in videolist:
        imagelist.extend(video.getFrames())

    imagelist.sort()

    with thread.ThreadPoolExecutor(8) as pool:
        for i in range(args.retry+1):
            if(len(imagelist))==0:
                print('all files has been processed')
                break
            wklist=[pool.submit(predAndDraw,target,args) for target in imagelist]
            imagelist=[]
            for wk in wklist:
                result=wk.result()
                if result[0] is None:
                    imagelist.append(result[1])
                else:
                    print('{} processed'.format(result[1][0]))
                    if csvfile:
                        csvfile.write(message2csv(result[0].dets,os.path.splitext(os.path.basename(result[1][0]))[0]))
                    if xsfile:
                        xsfile.write('{}:{},{},{}\n'.format(os.path.splitext(os.path.basename(result[1][0]))[0],
                                                            result[0].xsize,result[0].width,result[0].height))
    if csvfile:
        csvfile.close()
    if xsfile:
        xsfile.close()

    for target in imagelist:
        print('failed to process {}'.format(target[0]))
    for video in videolist:
        video.getVideo()



if __name__ == '__main__':
    predict(sys.argv[1:])