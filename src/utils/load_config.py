#!/usr/bin/env python2
#-*- coding: utf8 -*-
from easydict import EasyDict as edict
import yaml,os

def update(source,target):
    for key in target:
        if key not in source or (type(target[key]) != dict and type(target[key]) != edict) or \
                (type(source[key]) != dict and type(source[key]) != edict):
            source[key]=target[key]
        else:
            update(source[key],target[key])

def load_config(path):
    pdir=os.path.dirname(path)
    with open(path) as f:
        cf=edict(yaml.load(f))
    if 'include' in cf:
        for ipath in cf['include']:
            newpath=os.path.join(pdir,ipath)
            if os.path.isfile(newpath):
                with open(newpath) as f:
                    update(cf,yaml.load(f))
    return cf

def write_config(path,config):
    with open(path) as f:
        yaml.dump(config,f)