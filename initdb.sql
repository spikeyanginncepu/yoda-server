--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.8
-- Dumped by pg_dump version 9.5.8

-- Started on 2018-05-03 14:43:41 CST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 12403)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2203 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 185 (class 1259 OID 16589)
-- Name: dirauth; Type: TABLE; Schema: public; Owner: yoda
--

CREATE TABLE dirauth (
    folder text NOT NULL,
    userid integer,
    read integer,
    write integer,
    location text,
    id integer NOT NULL
);


ALTER TABLE dirauth OWNER TO yoda;

--
-- TOC entry 184 (class 1259 OID 16587)
-- Name: dirauth_id_seq; Type: SEQUENCE; Schema: public; Owner: yoda
--

CREATE SEQUENCE dirauth_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE dirauth_id_seq OWNER TO yoda;

--
-- TOC entry 2204 (class 0 OID 0)
-- Dependencies: 184
-- Name: dirauth_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yoda
--

ALTER SEQUENCE dirauth_id_seq OWNED BY dirauth.id;


--
-- TOC entry 181 (class 1259 OID 16548)
-- Name: model; Type: TABLE; Schema: public; Owner: yoda
--

CREATE TABLE model (
    modelname text NOT NULL,
    pipe text NOT NULL,
    deft text
);


ALTER TABLE model OWNER TO yoda;

--
-- TOC entry 187 (class 1259 OID 16602)
-- Name: task; Type: TABLE; Schema: public; Owner: yoda
--

CREATE TABLE task (
    id integer NOT NULL,
    name text,
    input text,
    modelname text,
    defts text
);


ALTER TABLE task OWNER TO yoda;

--
-- TOC entry 186 (class 1259 OID 16600)
-- Name: task_id_seq; Type: SEQUENCE; Schema: public; Owner: yoda
--

CREATE SEQUENCE task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE task_id_seq OWNER TO yoda;

--
-- TOC entry 2205 (class 0 OID 0)
-- Dependencies: 186
-- Name: task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yoda
--

ALTER SEQUENCE task_id_seq OWNED BY task.id;


--
-- TOC entry 189 (class 1259 OID 16624)
-- Name: taskauth; Type: TABLE; Schema: public; Owner: yoda
--

CREATE TABLE taskauth (
    id integer NOT NULL,
    userid integer,
    taskid integer,
    authority integer
);


ALTER TABLE taskauth OWNER TO yoda;

--
-- TOC entry 188 (class 1259 OID 16622)
-- Name: taskauth_id_seq; Type: SEQUENCE; Schema: public; Owner: yoda
--

CREATE SEQUENCE taskauth_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE taskauth_id_seq OWNER TO yoda;

--
-- TOC entry 2206 (class 0 OID 0)
-- Dependencies: 188
-- Name: taskauth_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yoda
--

ALTER SEQUENCE taskauth_id_seq OWNED BY taskauth.id;


--
-- TOC entry 183 (class 1259 OID 16558)
-- Name: user; Type: TABLE; Schema: public; Owner: yoda
--

CREATE TABLE users (
    uid integer NOT NULL,
    name text NOT NULL,
    salt text,
    passwd text,
    authority integer
);


ALTER TABLE users OWNER TO yoda;

--
-- TOC entry 182 (class 1259 OID 16556)
-- Name: user_uid_seq; Type: SEQUENCE; Schema: public; Owner: yoda
--

CREATE SEQUENCE user_uid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE user_uid_seq OWNER TO yoda;

--
-- TOC entry 2207 (class 0 OID 0)
-- Dependencies: 182
-- Name: user_uid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: yoda
--

ALTER SEQUENCE user_uid_seq OWNED BY users.uid;


--
-- TOC entry 2054 (class 2604 OID 16592)
-- Name: id; Type: DEFAULT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY dirauth ALTER COLUMN id SET DEFAULT nextval('dirauth_id_seq'::regclass);


--
-- TOC entry 2055 (class 2604 OID 16605)
-- Name: id; Type: DEFAULT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY task ALTER COLUMN id SET DEFAULT nextval('task_id_seq'::regclass);


--
-- TOC entry 2056 (class 2604 OID 16627)
-- Name: id; Type: DEFAULT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY taskauth ALTER COLUMN id SET DEFAULT nextval('taskauth_id_seq'::regclass);


--
-- TOC entry 2053 (class 2604 OID 16561)
-- Name: uid; Type: DEFAULT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY users ALTER COLUMN uid SET DEFAULT nextval('user_uid_seq'::regclass);


--
-- TOC entry 2191 (class 0 OID 16589)
-- Dependencies: 185
-- Data for Name: dirauth; Type: TABLE DATA; Schema: public; Owner: yoda
--

COPY dirauth (folder, userid, read, write, location, id) FROM stdin;
\.


--
-- TOC entry 2208 (class 0 OID 0)
-- Dependencies: 184
-- Name: dirauth_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yoda
--

SELECT pg_catalog.setval('dirauth_id_seq', 1, false);


--
-- TOC entry 2187 (class 0 OID 16548)
-- Dependencies: 181
-- Data for Name: model; Type: TABLE DATA; Schema: public; Owner: yoda
--

COPY model (modelname, pipe, deft) FROM stdin;
\.


--
-- TOC entry 2193 (class 0 OID 16602)
-- Dependencies: 187
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: yoda
--

COPY task (id, name, input, modelname, defts) FROM stdin;
\.


--
-- TOC entry 2209 (class 0 OID 0)
-- Dependencies: 186
-- Name: task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yoda
--

SELECT pg_catalog.setval('task_id_seq', 1, false);


--
-- TOC entry 2195 (class 0 OID 16624)
-- Dependencies: 189
-- Data for Name: taskauth; Type: TABLE DATA; Schema: public; Owner: yoda
--

COPY taskauth (id, userid, taskid, authority) FROM stdin;
\.


--
-- TOC entry 2210 (class 0 OID 0)
-- Dependencies: 188
-- Name: taskauth_id_seq; Type: SEQUENCE SET; Schema: public; Owner: yoda
--

SELECT pg_catalog.setval('taskauth_id_seq', 1, false);


--
-- TOC entry 2189 (class 0 OID 16558)
-- Dependencies: 183
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: yoda
--

COPY users (uid, name, salt, passwd, authority) FROM stdin;
1	admin	4HRZ0GN2BsxuA4WoxHmiVGpqq48=	iMPZ28q9Z8nxFnzbGYGUlqQPZr0A6NpuWcW3tPYuwz2NJ56CtuXyOXHsW67hlm78	7
\.


--
-- TOC entry 2211 (class 0 OID 0)
-- Dependencies: 182
-- Name: user_uid_seq; Type: SEQUENCE SET; Schema: public; Owner: yoda
--

SELECT pg_catalog.setval('user_uid_seq', 1, true);


--
-- TOC entry 2064 (class 2606 OID 16599)
-- Name: dirauth_folder_userid_location_key; Type: CONSTRAINT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY dirauth
    ADD CONSTRAINT dirauth_folder_userid_location_key UNIQUE (folder, userid, location);


--
-- TOC entry 2060 (class 2606 OID 16566)
-- Name: primary; Type: CONSTRAINT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY users
    ADD CONSTRAINT "primary" PRIMARY KEY (uid);


--
-- TOC entry 2058 (class 2606 OID 16555)
-- Name: primary key; Type: CONSTRAINT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY model
    ADD CONSTRAINT "primary key" PRIMARY KEY (modelname);


--
-- TOC entry 2066 (class 2606 OID 16597)
-- Name: primary of dirauth; Type: CONSTRAINT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY dirauth
    ADD CONSTRAINT "primary of dirauth" PRIMARY KEY (id);


--
-- TOC entry 2068 (class 2606 OID 16610)
-- Name: task_pkey; Type: CONSTRAINT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY task
    ADD CONSTRAINT task_pkey PRIMARY KEY (id);


--
-- TOC entry 2070 (class 2606 OID 16629)
-- Name: taskauth_pkey; Type: CONSTRAINT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY taskauth
    ADD CONSTRAINT taskauth_pkey PRIMARY KEY (id);


--
-- TOC entry 2072 (class 2606 OID 16631)
-- Name: uniq; Type: CONSTRAINT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY taskauth
    ADD CONSTRAINT uniq UNIQUE (userid, taskid);


--
-- TOC entry 2062 (class 2606 OID 16568)
-- Name: uniq username; Type: CONSTRAINT; Schema: public; Owner: yoda
--

ALTER TABLE ONLY users
    ADD CONSTRAINT "uniq username" UNIQUE (name);


--
-- TOC entry 2202 (class 0 OID 0)
-- Dependencies: 6
-- Name: public; Type: ACL; Schema: -; Owner: yoda
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM yoda;
GRANT ALL ON SCHEMA public TO yoda;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2018-05-03 14:43:41 CST

--
-- PostgreSQL database dump complete
--

