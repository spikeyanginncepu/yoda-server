#!/usr/bin/env python2
#-*- coding: utf8 -*-
# --------------------------------------------------------
# Data splitter
# Copyright (c) 2017 by flish_wang(bwang)
# Copyright (c) 2017 geiri,SGCC
# Licensed under The Apache-2.0 License [see LICENSE for details]
# --------------------------------------------------------

eps=0.001
eps2=0.00001
class location:
    '''This class provide some tools operating the images' relative and absolute locations with their parent images.
    The default loc format is relative. Use location(RELloc) or location(absloc=ABSloc, picsize=PICSIZE) to init the
    object. RELloc should be a list or tuple of (xc,yc,w,h), absloc should be (x1,y1,x2,y2), picsize should be
    (width(x),height(y)). We assume that the ABSloc begins with 1 and ends with width or height'''

    def __init__(self, relloc=None, absloc=None, picsize=None):
        self.pwidth=None
        self.pheight=None
        if picsize:
            self.pwidth=picsize[0]
            self.pheight=picsize[1]
        if absloc:
            self.setabsloc(absloc=absloc)
        else:
            self.setrelloc(relloc=relloc)

    def assertpsize(self,action='doing this'):
        assert self.pwidth != None, 'when {}, picsize must be set first!'.format(action)

    def setabsloc(self,absloc):
        absloc=[float(i) for i in absloc[0:4]]
        self.assertpsize('setting image size with absolute coordinates')
        self.xc = float(absloc[0] + absloc[2] ) / 2.0 / self.pwidth
        self.yc = float(absloc[1] + absloc[3] ) / 2.0 / self.pheight
        self.w = float(absloc[2] - absloc[0]) / self.pwidth
        self.h = float(absloc[3] - absloc[1]) /self.pheight

    def setrelloc(self,relloc):
        relloc = [float(i) for i in relloc[0:4]]
        self.xc, self.yc, self.w, self.h = tuple(relloc)

    def setpsize(self, picsize):
        '''set picture size, picsize=(pwidth,pheight)'''
        self.pwidth=float(picsize[0])
        self.pheight=float(picsize[1])


    def getpsize(self):
        self.assertpsize('getting pic size')
        return (self.pwidth,self.pheight)

    def getpwidth(self):
        return self.pwidth

    def getpheight(self):
        return self.pheight

    def getrelloc(self):
        return (self.xc,self.yc,self.w,self.h)

    def getabsloc(self, integer=True,minpixel=0,limit=True):
        self.assertpsize('getting absolute loc')
        if limit:
            result=[max(minpixel,(self.xc-self.w/2)*self.pwidth),max(minpixel,(self.yc-self.h/2)*self.pheight),
                    min(self.pwidth,(self.xc+self.w/2)*self.pwidth),min(self.pheight,(self.yc+self.h/2)*self.pheight)]
        else:
            result=[(self.xc-self.w/2)*self.pwidth,(self.yc-self.h/2)*self.pheight,
                    (self.xc + self.w / 2) * self.pwidth,(self.yc+self.h/2)*self.pheight]
        if integer:
            assert self.w*self.pwidth>1,\
                'x2-x1={}, which must larger than 1 pixel! try using smooth() to fix it'.format(self.w * self.pwidth)
            assert self.h * self.pheight > 1, \
                'y2-y1={}, which must larger than 1 pixel! try using smooth() to fix it'.format(self.h * self.pheight)
            result=[int(t+eps) for t in result]
        return result

    def printrelloc(self,format=None):
        '''return a string with 'xc,yc,w,h'. When providing format, {xc} represents xc, etc..
         see https://docs.python.org/3/library/string.html#format-string-syntax for more details.
         eg: format='{xc},{yc},{w},{h}' will return 'xc,yc,w,h'. '''
        format = '{xc},{yc},{w},{h}' if format==None else format
        return format.format(xc=self.xc,yc=self.yc,w=self.w,h=self.h)

    def printabsloc(self,format=None,integer=True,minpixel=1):
        '''return a string with 'x1,y1,x2,y2'. When providing format, {xc} represents xc, etc..
         see https://docs.python.org/3/library/string.html#format-string-syntax for more details.
         eg: format='{x1},{x2},{y1},{y2}' will return 'x1,x2,y1,y2'. '''
        self.assertpsize()
        format = '{x1},{y1},{x2},{y2}' if format == None else format
        data=self.getabsloc(minpixel=minpixel, integer=integer)
        return format.format(x1=data[0],y1=data[1],x2=data[2],y2=data[3])


    def stepin(self, ppo):
        '''return the transformation of this object using the providing parent object (ppo) as reference '''
        nxc= 0.5 + (self.xc - ppo.xc)/ppo.w
        nyc= 0.5 + (self.yc - ppo.yc)/ppo.h
        nw= self.w/ppo.w
        nh= self.h/ppo.h
        nwidth=None
        nheight=None

        if (ppo.pwidth != None):
            nwidth=float(ppo.pwidth * ppo.w+eps)
            nheight=float(ppo.pheight * ppo.h + eps)
        elif (self.pwidth != None):
            nwidth=float(self.pwidth * ppo.w +eps)
            nheight=float(self.pheight * ppo.h +eps)

        rloc=location((nxc,nyc,nw,nh))
        if nwidth != None:
            rloc.setpsize((nwidth,nheight))
        return rloc

    def stepout(self,ppo):
        '''return the transformation of this object using the providing parent object's (ppo) parent as reference '''
        nxc = ppo.xc + (self.xc - 0.5) *ppo.w
        nyc = ppo.yc + (self.yc - 0.5) *ppo.h
        nw = self.w * ppo.w
        nh = self.h * ppo.h
        nwidth=None
        nheight=None
        if ppo.pwidth != None:
            nwidth=ppo.pwidth
            nheight=ppo.pheight
        elif self.pwidth != None:
            nwidth=float(self.pwidth/ppo.w+eps)
            nheight=float(self.pheight/ppo.h+eps)

        rloc=location((nxc,nyc,nw,nh))
        if nwidth != None:
            rloc.setpsize((nwidth,nheight))
        return rloc

    def smooth(self, minwidth=5.0, minheight=5.0, minpixel=0):
        '''
        if psize set, smooth the image coordinate so that the w and h could be larger than minwidth and minheight
        (pixels), respectively.
        then modify the image box so that it could be in the picture'''
        gw=eps2 if self.pwidth == None else minwidth/self.pwidth
        gh=eps2 if self.pwidth == None else minheight/self.pheight

        minx=minpixel / self.pwidth if self.pwidth != None else 0.0
        miny=minpixel / self.pheight if self.pheight != None else 0.0
        maxx= 1.0
        maxy= 1.0

        minxc=max(gw/2+minx,self.xc+ (minx - (self.xc - self.w/2))/2 )
        minyc=max(gh/2+miny,self.yc+ (miny - (self.yc - self.h/2))/2 )
        maxxc=min(maxx-gw/2,self.xc- (self.xc+self.w/2-maxx)/2 )
        maxyc=min(maxy-gh/2,self.yc- (self.yc+self.h/2-maxy)/2 )

        self.xc=min(maxxc, max(minxc, self.xc))
        self.yc=min(maxyc, max(minyc, self.yc))

        maxw=min(self.xc-minx,maxx-self.xc)*2
        maxh=min(self.yc-miny,maxy-self.yc)*2
        self.w=min(maxw,max(gw,self.w))
        self.h=min(maxh,max(gh,self.h))
        return self



