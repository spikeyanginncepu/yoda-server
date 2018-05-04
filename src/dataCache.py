import os,sys,re
from copy import copy

def _getChild(dataCache,name):
    r=copy(dataCache)
    if dataCache.cache.get('children',None) is None:
        dataCache.update()
    assert name in dataCache.cachedict['children']
    r.path=os.path.join(r.path,name)
    r.cachedict=r.cachedict['children'][name]
    return r

def _rmCache(dataCache):
    dataCache.cache.clear()

def _update(dataCache):
    raise NotImplementedError

def _report(dataCache,pathlist,depth,limits,filters,columns,orderby):



class dataCache:
    def __init__(self,cachedict,path=''):
        self.cache=cachedict
        self.location=path

