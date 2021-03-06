# Putup

A command line interface for static blog generation.

[Live demo](https://albertaz.com/blog/)

![Alt text](./demo/d1.png)
![Alt text](./demo/d2.png)

## Features

* Fast blog generation for your markdown writing
* Simple setup & configuration, no more plugins & development including.
* Freshing style without numerous and complicated theme choices.
* Internal integration of Webpack production mode.
* Local server to preview the blog.

## Installation
```
$ npm install putup -g
```

When get error log ` EACCES: permission denied`, use:
```
$ sudo npm install putup -g
```

## Quick Start

**Create your blog**

```
$ putup create myblog
$ cd myblog
```
the `<myblog>` dir will be created with overwrite check, including initial config fle and a posts dir for you to post.

```
.
├── assets
│   ├── favicon.png
│   └── img
├── config.json
└── posts
    ├── about.md
    └── Hello World.md

```

**Create a new post**

```
$ putup post <postName>

```
 `<postName>.md` file will be created in `posts` folder.

**Build your blog site**

```
$ putup build -d <dist>
```

the command will build your blog to `<dist>` folder, default `dist`.


**Preview your blog site**

```
$ putup preview -p 8088
```

A local static server will be default hosted at `localhost: 3000`.


**Get Command help**

```
$ putup --help
```


## simple config.json

simple configuration for the base information of your blog.

```js
{
  "name": "",
  "host": "www.your.blog",
  "description": "",
  "author": "albertaz",
  "keywords": ""
}

```

## post file pattern

follow the example below:

```
----
title: Hello world
date: 2018-12-02
layout: about
----

```

default layout is `post`


