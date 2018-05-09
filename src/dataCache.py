import os,sys,re
import error
class dataCache(object):
    def update(self,path,*args,**kwargs):
        raise NotImplementedError

    def rmCache(self,  path):
        if len(path)>1 and path.endswith('/'):
            path=path[:-1]
        if path in self.cache and self.cache[path] is not None:
            if type(self.cache[path])!= str and 'children' in self.cache[path]:
                for name in self.cache[path]['children']:
                    self.rmCache(os.path.join(path,name))
        self.cache[path]=None
        return True
    def _get(self,path):
        if len(path)>1 and path.endswith('/'):
            path=path[:-1]
        if path in self.cache and self.cache[path] is not None:
            return self.cache[path]
        else:
            self.update(path)
        return self.cache[path]

    def get(self,path,field=None):
        content=self._get(path)
        if field is None or type(content) == str:
            return content
        elif field in content:
            return content[field]
        else:
            return 'notExist'

    def report(self,  curpath, depth=1,
                limits=(1,-1), filters=tuple(), columns=tuple(), orderby='name',
                curdepth=0,transforms=None):
        #loc must be None if called from outsider!
        if curdepth==0:
            llow=limits[0] if limits[0]<0 else limits[0]-1
            lhigh=limits[1]+1 if limits[1]<0 else limits[1]
            limits=(llow if llow!=0 else None,lhigh if lhigh!=0 else None)
            limits=[limits for _ in range(depth)]

        content=self._get(curpath)
        if type(content) == str:
            raise(error.OtherError,content)
        finalContent=dict()

        for line in filters:
            if len(line)>2:
                filterName, fContent, filterRange=line
                if curdepth<filterRange[0] or curdepth>filterRange[1]:
                    continue
            else:
                filterName, fContent = line
                if fContent not in content[filterName]:
                    return None

        for name in columns:
            if name=='children' and curdepth==depth:
                cc='notLoaded'
            elif name=='children' and name in content:
                names=content['children']
                children=[self.report(os.path.join(curpath,name),depth=depth,limits=limits,
                                      filters=filters,columns=columns,orderby=orderby,curdepth=curdepth+1) for name in names]
                children.sort(key=lambda x: x.get(orderby,None))
                children=children[limits[curdepth][0]:limits[curdepth][1]]
                cc=children
            elif name in content:
                cc=content[name]
            else:
                cc=''
            finalContent[name]=cc if transforms is None or name not in transforms else transforms[name](cc)
        return finalContent
    def __init__(self,*args,**kwargs):
        self.cache=dict()
