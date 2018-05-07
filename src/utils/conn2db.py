import os,configparser,psycopg2

def conn2db(config):
    conn=psycopg2.connect(host=config.db.get('host',None), database=config.db.get('database',None),
                            user=config.db.get('user',None), password=config.db.get('password',None))
    conn.autocommit = True
    return conn

